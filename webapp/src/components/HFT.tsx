import React, {useState, useEffect, ChangeEvent} from 'react';
import {
    Button,
    Input,
    FormControl,
    FormLabel,
    FormHelperText,
    VStack,
    Center,
    Text,
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
    // const [tokenURI, setTokenURI] = useState('');
    const [nftTokens, setNftTokens] = useState<number[]>([]);
    const [searchTokenId, setSearchTokenId] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tokenURI, setTokenURI] = useState<string>('');


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
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
                        'pinata_api_key': 'YOUR_PINATA_API_KEY',
                        'pinata_secret_api_key': 'YOUR_PINATA_SECRET_API_KEY',
                    },
                    body: formData,
                });

                console.log(111);
                if (response.ok) {
                    const data = await response.json();
                    const uri = `ipfs://${data.IpfsHash}`;
                    setTokenURI(uri);
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






    const getNFTURI = async () => {
        if (!contractAddress || !currentAccount || !tokenURI) {
            console.error('合约地址、当前账户或 Token URI 未设置');
            return;
        }

        try {
            const rpcURL = 'http://localhost:8545'; // Hardhat 本地链的 RPC URL，替换为你的本地链 URL

            const provider = new ethers.providers.JsonRpcProvider(rpcURL);
            const signer = provider.getSigner();
            const contract = new Contract(contractAddress, HFTABI, signer);
            const tokenURI = await contract.getNFTMataData(searchTokenId);
;           console.log(tokenURI);
        } catch (error) {
            console.error('铸造 NFT 时出错:', error);
        }
    };


    return (
        <VStack spacing={4} alignItems="center">
            {/*<FormControl>*/}
            {/*    <FormLabel>Token URI</FormLabel>*/}
            {/*    <Input*/}
            {/*        type="text"*/}
            {/*        value={tokenURI}*/}
            {/*        onChange={(e) => setTokenURI(e.target.value)}*/}
            {/*    />*/}
            {/*    <FormHelperText>输入新 Token 的 URI</FormHelperText>*/}
            {/*</FormControl>*/}

            <FormControl>
                <FormLabel>上传文件</FormLabel>
                <Input type="file" onChange={handleFileChange} />
                <FormHelperText>选择要上传的文件</FormHelperText>
            </FormControl>

            <Button onClick={generateTokenURI}>生成 Token URI</Button>


            <Button onClick={mintNFT}>铸造 NFT</Button>
            <FormControl>
                <FormLabel>Token ID</FormLabel>
                <Input
                    type="number" // 将 type 设置为 "number"
                    value={searchTokenId}
                    onChange={(e) => setSearchTokenId(parseInt(e.target.value))}
                    // 使用 parseInt 将输入的字符串转换为数字类型
                />
                <FormHelperText>输入新 Token 的 ID</FormHelperText>
            </FormControl>
            <Button onClick={getNFTURI}>查询 NFT</Button>



        </VStack>
    );
};

export default HFT;
