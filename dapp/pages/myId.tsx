'use client';
import {
    Card,
    CardBody,
    Button,
    Center
} from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { readContract} from '@wagmi/core'
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Data from '../abi/Data.json';

const addressData = process.env.NEXT_PUBLIC_DATA_SC;

function formatUnixEpochTime(unixEpochTime: number | bigint): string {
    const unixEpochTimeAsNumber = typeof unixEpochTime === 'bigint' ? Number(unixEpochTime) : unixEpochTime;
    const formattedDate = format(new Date(unixEpochTimeAsNumber * 1000), 'dd/MM/yyyy ');
    return formattedDate;
}

const MyId: NextPage = () => {
    const { address, isConnected } = useAccount();
    const [isClient, setIsClient] = useState(false);
    const [idData, setIdData] = useState<any>(null);

    const findIdData = () => {
        readContract({
            address: addressData as '0x{string}',
            abi: Data.abi,
            functionName: 'myID',
            account: address,
            args: [],
        }).then((data) => {
            setIdData(data);
            console.log(data);
        });
    }

    useEffect(() => {
        setIsClient(true);
        findIdData();
    }, [address, isConnected]);

    return (

        <div className={styles.container}>
            <Head>
                <title>My id</title>
                <meta
                    content="My Id"
                    name="Get your id"
                />
                <link href="/arbitrumShield.svg" rel="icon" />
            </Head>
            <header className={styles.header}>
                <ConnectButton />
                <Button colorScheme='blue' onClick={() => window.location.href = '/'}>Back</Button>
            </header>
            <main className={styles.main}>
                {isClient && idData && isConnected && (
                    <Card>
                        <CardBody>
                            {idData[1] != 0 ? (
                                <>
                                    <Center>{`OrbitId${idData[1].toString()}`}</Center>
                                    <br />
                                    <p>{`Name: ${idData[0].firstName} ${idData[0].lastName}`}</p>
                                    <p>{`Date of birth: ${formatUnixEpochTime(idData[0].birthDate)}`}</p>
                                    <p>{`Birth place: ${idData[0].birthPlace}`}</p>
                                </>
                            ) : (
                                `You don't have an ID yet. Please ask someone to create one for you.`
                            )}
                        </CardBody>
                    </Card>
                )}
            </main>
        </div>
    )
}

export default MyId;