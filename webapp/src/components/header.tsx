//src/components/header.tsx
import NextLink from "next/link"
import {Flex, Button, useColorModeValue, Spacer, Heading, LinkBox, LinkOverlay, Center} from '@chakra-ui/react'

const siteTitle="Obel-Dapp"
export default function Header() {

  return (
    <Flex as='header' bg={useColorModeValue('gray.100', 'gray.900')} p={4} alignItems='center'>
      <LinkBox>
        <NextLink href={'/'} passHref>
            <Center>
                <LinkOverlay>
                    <Heading size="md">{siteTitle}</Heading>
                </LinkOverlay>
            </Center>
        </NextLink>
      </LinkBox>      
      <Spacer />
      {/*<Button >Button for Account </Button>*/}
    </Flex>
  )
}
