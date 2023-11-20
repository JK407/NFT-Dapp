import React, {useState, useEffect, ChangeEvent, useRef} from 'react';
import { AiOutlinePlus } from "react-icons/ai"; // 导入加号图标
import {
    Button,
    Input,
    FormControl,
    FormLabel,
    FormHelperText,
    VStack,
    Center,
    Text, Icon, HStack, Stack,
} from '@chakra-ui/react';
import { Contract } from 'ethers';
import { HFTABI } from 'abi/HFTABI'; // 替换成你的 ABI 导入路径
import { ethers } from 'ethers';
import {Box} from "@chakra-ui/layout";

interface Props {
    contractAddress: string;
    currentAccount: string | undefined;
}

const HFT: React.FC<Props> = (props) => {
    const { contractAddress, currentAccount } = props;
    const [nftTokens, setNftTokens] = useState<number[]>([]);
    const [searchTokenId, setSearchTokenId] = useState<string>('');

    const [tokenURI, setTokenURI] = useState<string>('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const fileNameRef = useRef<HTMLDivElement | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [attributeName, setAttributeName] = useState('');
    const [attributeValue, setAttributeValue] = useState('');
    const [jsonData, setJsonData] = useState<string | null>(null);



    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewURL(url);

            // 检查是否存在 fileNameRef.current
            if (fileNameRef.current) {
                fileNameRef.current.innerText = file.name;
            }
        }
    };


    // const handleButtonClick = () => {
    //     if (fileInputRef.current) {
    //         fileInputRef.current.click();
    //     }
    // };

    // todo 无法重新选择文件
    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // 清空文件选择框的值
            fileInputRef.current.click();
        }
    };




    const generateTokenURI = async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                    method: 'POST',
                    headers: {
                        'pinata_api_key': 'ed2bfae38ffac0b0ad6a',
                        'pinata_secret_api_key': 'fc54c20c18a84cb0f7353784168aab29cec1ba589043d606be74b58c3776b5b5',
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    const uri = `ipfs://${data.IpfsHash}`;
                    setTokenURI(uri);
                    console.log('上传至 IPFS 成功:', uri);
                } else {
                    console.error('上传至 IPFS 失败:', response.statusText);
                }
            } catch (error) {
                console.error('上传至 IPFS 时出错:', error);
            }
        } else {
            console.error('未选择文件');
        }
    };


    const checkAndConvertToJSON = () => {
        // 将IPFS地址转换为可以展示的形式
        const convertedImageUrl = convertImgUrl(tokenURI);
        console.log(convertedImageUrl)
        // 检查是否所有输入框都已填入值
        if (name && description && attributeName && attributeValue && tokenURI ) {
            // 创建一个JSON对象
            const data = {
                name: name,
                description: description,
                attribute: {
                    attributeName: attributeName,
                    attributeValue: attributeValue,
                },
                image: convertedImageUrl,
            };

            // 将JSON对象转换为字符串并更新state
            setJsonData(JSON.stringify(data));
            console.log(jsonData)
            uploadJsonToPinata(jsonData)
        } else {
            // 如果有输入框未填入值，给出提示或者进行其他操作
            console.log('请填写所有内容');
        }
    };

    const uploadJsonToPinata = async (jsonData: string | null) => {
        try {
            if (!jsonData) {
                console.error('传递的 JSON 数据为空');
                return;
            }

            // 如果传递的是字符串，尝试将其解析为 JSON 对象
            let parsedData;
            parsedData = JSON.parse(jsonData);

            const apiKey = 'ed2bfae38ffac0b0ad6a';
            const apiSecret = 'fc54c20c18a84cb0f7353784168aab29cec1ba589043d606be74b58c3776b5b5';

            const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': apiKey,
                    'pinata_secret_api_key': apiSecret,
                },
                body: JSON.stringify(parsedData),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('文件上传成功:', result);

                // 提取并使用获取到的 IpfsHash
                const ipfsHash = result.IpfsHash;
                console.log('获取到的 IpfsHash:', ipfsHash);
                const ipfsUrl = `ipfs://${ipfsHash}`;
                console.log('获取到的 ipfsUrl:', ipfsUrl);
                setTokenURI(ipfsUrl);

            } else {
                console.error('文件上传失败:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('上传失败', error);
        }
    };

    const mintNFT = async () => {
        if (!contractAddress || !currentAccount || !tokenURI) {
            console.error('合约地址、当前账户或 Token URI 未设置');
            return;
        }

        try {
            const rpcURL = 'http://localhost:8545'; // Hardhat 本地链的 RPC URL，替换为你的本地链 URL

            const provider = new ethers.providers.JsonRpcProvider(rpcURL);
            const signer = provider.getSigner();
            const contract = new Contract(contractAddress, HFTABI, signer);
            console.log('tokenURI:', tokenURI);
            const tx = await contract.mintNFT(currentAccount, tokenURI);
            console.log('tx:', tx);
            const receipt = await tx.wait();
            console.log('receipt:', receipt);
            console.log('NFT 铸造成功');
            console.log('NFT Address:', contractAddress)
            console.log('NFT Token ID:', receipt.events[0].args[2].toNumber());

            // Update token list for current account
            setNftTokens([...nftTokens, receipt.events[0].args[2].toNumber()]);
        } catch (error) {
            console.error('铸造 NFT 时出错:', error);
        }
    };


    const getMetadataFromURI = async (uri: RequestInfo) => {
        try {
            const response = await fetch(uri);
            const metadata = await response.json();
            console.log(metadata); // 这里会输出 JSON 文件中的元数据内容
            // 在这里你可以根据需要处理元数据，比如展示在页面上或者进行其他操作

            // 获取 image 字段的值
            const imageUrl = metadata.image;
            console.log('Image URL:', imageUrl);
            setImageUrl(imageUrl);


        } catch (error) {
            console.error('获取元数据时出错:', error);
        }
    };




    const getNFTURI = async () => {
        if (!contractAddress || !currentAccount || !tokenURI) {
            console.error('合约地址、当前账户或 Token URI 未设置');
            return;
        }

        try {
            const rpcURL = 'http://localhost:8545'; // Hardhat 本地链的 RPC URL，替换为你的本地链 URL

            const provider = new ethers.providers.JsonRpcProvider(rpcURL);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, HFTABI, signer);
            const tokenURI = await contract.getNFTMataData(searchTokenId);

            if (!tokenURI) {
                console.error('未获取到 tokenURI');
                return;
            }


            // 将IPFS地址转换为可以展示的形式
            const convertedImageUrl = convertImgUrl(tokenURI);
            // console.log(convertedImageUrl)
            // setImageUrl(convertedImageUrl);
            // 获取元数据
            getMetadataFromURI(convertedImageUrl);

        } catch (error) {
            console.error('查询NFT时出错:', error);
        }
    };

    const convertIPFSUrl = (ipfsUrl: string) => {
        // 将IPFS地址转换为 https://ipfs.io/ipfs/ 的形式
        const convertedUrl = ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        return convertedUrl;
    };

    const convertImgUrl = (ipfsUrl: string) => {
        // 将IPFS地址转换为 https://ipfs.io/ipfs/ 的形式
        const convertedUrl = ipfsUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        return convertedUrl;
    };








    return (
        <VStack spacing={4} alignItems="center">

                <HStack spacing={8} alignItems="flex-start">
                    <div style={{ flex: 1 }}>
                        <Stack spacing={4}>
                            <FormControl>
                                <div
                                    onClick={handleButtonClick}
                                    style={{
                                        width: "200px",
                                        height: "200px",
                                        border: "2px dashed #ccc",
                                        borderRadius: "5px",
                                        position: "relative",
                                        overflow: "hidden",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    {!previewURL && (
                                        <React.Fragment>
                                            <span style={{ fontSize: "48px" }}>+</span>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                tabIndex={-1}
                                                ref={fileInputRef}
                                                style={{
                                                    position: "absolute",
                                                    width: "100%",
                                                    height: "100%",
                                                    top: 0,
                                                    left: 0,
                                                    opacity: 0,
                                                    cursor: "pointer",
                                                    zIndex: -1, // 确保文件输入框在下层
                                                }}
                                            />
                                        </React.Fragment>
                                    )}
                                    {previewURL && (
                                        <React.Fragment>
                                            <img
                                                src={previewURL}
                                                alt="Preview"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    borderRadius: "5px",
                                                }}
                                            />
                                            <div
                                                ref={fileNameRef}
                                                style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    textAlign: "center",
                                                    color: "#fff",
                                                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                {selectedFile?.name}
                                            </div>
                                        </React.Fragment>
                                    )}
                                </div>
                            </FormControl>
                            <Button onClick={generateTokenURI} style={{ width: '200px' }}>
                                生成 Token URI
                            </Button>

                        </Stack>

                    </div>
                    <VStack spacing={4} style={{ flex: 1 }}>
                        {/* 右边的内容 */}
                        <Input
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <FormControl>
                            <div
                                style={{
                                    width: '100%',
                                    border: '2px dashed #ccc',
                                    borderRadius: '5px',
                                    padding: '10px',
                                }}
                            >
                                <Input
                                    placeholder="Attribute Name"
                                    value={attributeName}
                                    onChange={(e) => setAttributeName(e.target.value)}
                                />
                                <Input
                                    placeholder="Attribute Value"
                                    value={attributeValue}
                                    onChange={(e) => setAttributeValue(e.target.value)}
                                />
                            </div>
                        </FormControl>
                        <Button onClick={checkAndConvertToJSON}>转换为JSON</Button>
                        {/*{jsonData && (*/}
                        {/*    <div>*/}
                        {/*        <p>JSON 数据:</p>*/}
                        {/*        <pre>{jsonData}</pre>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </VStack>
                </HStack>



            <Button onClick={mintNFT}>铸造 NFT</Button>
            <FormControl>
                <FormLabel>Token ID</FormLabel>
                <Input
                    type="number"
                    value={searchTokenId}
                    onChange={(e) => setSearchTokenId(e.target.value)}
                />
                <FormHelperText>输入新 Token 的 ID</FormHelperText>
            </FormControl>
            <Button onClick={getNFTURI}>查询 NFT</Button>
            {imageUrl && <img src={imageUrl} alt="NFT图片" />} {/* 显示图片 */}



        </VStack>
    );
};

export default HFT;
