// src/pages/index.tsx
import type { NextPage } from 'next'
import Head from 'next/head'
import { VStack, Heading, Box, LinkOverlay, LinkBox} from "@chakra-ui/layout"
import {Text, Button, Flex} from '@chakra-ui/react'
import { useState, useEffect} from 'react'
import {ethers} from "ethers"
import HFT from "../components/HFT";


declare let window:any

const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [chainname, setChainName] = useState<string | undefined>()


  useEffect(() => {
    //get ETH balance and network info only when having currentAccount 
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return

    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.getBalance(currentAccount).then((result)=>{
      setBalance(ethers.utils.formatEther(result))
    }).catch((e)=>console.log(e))

    provider.getNetwork().then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    }).catch((e)=>console.log(e))

  },[currentAccount])

  //click connect
  const onClickConnect = () => {
    //client side code
    if(!window.ethereum) {
      console.log("please install MetaMask")
      return
    }
    //we can do it using ethers.js
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.send("eth_requestAccounts", [])
    .then((accounts)=>{
      if(accounts.length>0) setCurrentAccount(accounts[0])
    }).catch((e)=>console.log(e))

  }

  //click disconnect
  const onClickDisconnect = () => {
    console.log("onClickDisConnect")
    setBalance(undefined)
    setCurrentAccount(undefined)
  }

  return (
    <>
      <Head>
        <title>Oberl DAPP</title>
      </Head>

      <Flex justifyContent="center">
        <Heading as="h3" my={4}>NFT Dapp BY Oberl Fitzgeald</Heading>
      </Flex>
      <VStack>
        <Box w='100%' my={4}>
        {currentAccount  
          ? <Button type="button" w='100%' onClick={onClickDisconnect}>
                Account:{currentAccount}
            </Button>
          : <Button type="button" w='100%' onClick={onClickConnect}>
                  Connect MetaMask
              </Button>
        }
        </Box>
        {currentAccount  
          ?<Box mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
              <Heading my={4} fontSize='3xl' textAlign='center'>
                Account Info
              </Heading>
              <Text textAlign='center'>
                ETH Balance of current account: {balance}
              </Text>
              <Text textAlign='center'>
                Chain Info: ChainId {chainId} name {chainname}
              </Text>
            </Box>

            :<></>
        }

        <Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4} fontSize='5xl' textAlign='center'>
            NFT
          </Heading>
          <Text textAlign='center' mt={2} fontWeight='bold'>
            合约地址：0x5FbDB2315678afecb367f032d93F642f64180aa3
          </Text>


          <HFT
              contractAddress='0x5FbDB2315678afecb367f032d93F642f64180aa3'
              currentAccount={currentAccount}
          />
        </Box>




      </VStack>
    </>
  )
}

export default Home
