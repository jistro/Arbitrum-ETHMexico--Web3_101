'use client';
import {
  Card,
  CardBody,
  Divider,
  Input,
  Button,
  Select,
  Box,
  AbsoluteCenter,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { readContract, prepareWriteContract, writeContract } from '@wagmi/core'
import { useAccount } from 'wagmi';
import { ContractFunctionExecutionError } from 'viem';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Service from '../abi/Service.json';

const addressService = process.env.NEXT_PUBLIC_SERVICE_SC;

function formatUnixEpochTime(unixEpochTime: number | bigint): string {
  const unixEpochTimeAsNumber = typeof unixEpochTime === 'bigint' ? Number(unixEpochTime) : unixEpochTime;
  const formattedDate = format(new Date(unixEpochTimeAsNumber * 1000), 'dd/MM/yyyy HH:mm:ss');
  return formattedDate;
}

function formatEmployeeData(data: any) {
  const formattedData = {
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
    ingressDate: data.ingressDate,
    egressDate: data.egressDate,
  }
  return (
    <Card>
      <CardBody>

        <strong>Name:</strong> {formattedData.firstName} {formattedData.lastName}

        <p>
          <strong>Role:</strong> {
            formattedData.role === 1 ? 'Admin' : formattedData.role === 2 ? 'Manager' : 'Employee'
          }
          <p>
            {formattedData.egressDate != 0 ?
              `Egress Date:${formatUnixEpochTime(formattedData.egressDate)}`
              :
              `Ingress Date:${formatUnixEpochTime(formattedData.ingressDate)}`
            }
          </p>
        </p>
      </CardBody>
    </Card>


  )
}

function convertTimeToUnixEpochTime(time: string): number {
  const date = new Date(time);
  const unixEpochTime = date.getTime() / 1000;
  return unixEpochTime;
}

const TextMenu = ({ text = '' }: { text?: string }) => (

  <Box position='relative' padding='5'>
    <Divider />
    <AbsoluteCenter bg='white' px='4'>
      {text}
    </AbsoluteCenter>
  </Box>

)

const handleError = (error: any) => {
  if (error instanceof ContractFunctionExecutionError) {
    if (error.message.includes("Service__OnlyAdmin()")) {
      alert('Only the admin can perform this action');
    } else if (error.message.includes("Service__OnlyManagerEmployee()")) {
      alert('Only the manager or employee can perform this action');
    } else if (error.message.includes("Service__OnlyGeneralEmployee()")) {
      alert('Only the employee can perform this action');
    } else if (error.message.includes("Service__EmployeeExist()")) {
      alert('The employee already exists');
    } else if (error.message.includes("Service__CantRemoveYourself()")) {
      alert('You can\'t remove yourself');
    } else if (error.message.includes("Service__EmployeeAlreadyEgress()")) {
      alert('The employee already egress');
    } else if (error.message.includes("Service__EmployeeIsStillActive()")) {
      alert('The employee is still active');
    } else if (error.message.includes("Service__IDDontExist()")) {
      alert('The ID don\'t exist');
    } else if (error.message.includes("Service__AddressDoesntHaveIDAssigned()")) {
      alert('The address doesn\'t have ID assigned');
    } else {
      alert("Ocurrió un error al obtener los datos del AVC.");
    }
  } else {
    alert("Ocurrió un error al interactuar con el contrato.");
  }
  console.error("Error:", error);
};


const Home: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const [employee, setEmployee] = useState<any>(null);
  const [metadataFindEmployee, setMetadataFindEmployee] = useState<any>(null);
  const [idmetadataFind, setIdmetadataFind] = useState<any>([0, null]);
  const [txData, setTxData] = useState<any>(['null', 0]);

  const messageSuccess = (msge: string) => {
    return (<div
      style={{
        marginTop: '20px',
        padding: '10px 26%',
      }}
    >
      <Alert status='success'>
        <AlertIcon />
        <Box
          height='100%'
        >
          <AlertTitle>
            Transaction successful!
          </AlertTitle>
          <AlertDescription>
            <p>{msge}</p>
          </AlertDescription>
        </Box>
        <CloseButton
          alignSelf='flex-start'
          position='relative'
          right={-1}
          top={-1}
          onClick={() => setTxData(['null', 0])}
        />
      </Alert>
    </div>)
  }

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getDataEmployee = () => {
    readContract({
      address: addressService as '0x${string}',
      abi: Service.abi,
      functionName: 'getMyInfo',
      account: address,
    }).then((data) => {
      setEmployee(data);
    }).catch(handleError);
  }

  useEffect(() => {
    if (isConnected) {
      getDataEmployee();
    }
  }, [isConnected, address]);

  const registerEmployee = () => {
    const inputIds = [
      'newEmployee__address',
      'newEmployee__firstName',
      'newEmployee__lastName',
      'newEmployee__role',
    ];
    const inputs = inputIds.map((id) => document.getElementById(id) as HTMLInputElement);
    const addressEmployee = inputs[0].value;
    const firstName = inputs[1].value;
    const lastName = inputs[2].value;
    const role = inputs[3].value;
    if (inputs.some((input) => input.value === '')) {
      alert('Fill all inputs');
    }

    prepareWriteContract({
      address: addressService as '0x${string}',
      abi: Service.abi,
      functionName: 'newEmployee',
      args: [addressEmployee, firstName, lastName, parseInt(role)],
      account: address,
    }).then((data) => {

      writeContract(data).then(() => {
        setTxData(['Adm1', data.result]);
      });
    }).catch(handleError);
  }

  const findEmployee = () => {
    const inputIds = [
      'findEmployee__address',
    ];
    const inputs = inputIds.map((id) => document.getElementById(id) as HTMLInputElement);
    const addressFind = inputs[0].value;
    if (addressFind === '') {
      alert('Address is empty');
    }

    readContract({
      address: addressService as '0x${string}',
      abi: Service.abi,
      functionName: 'getEmployee',
      args: [addressFind],
      account: address,
    }).then((data) => {
      setMetadataFindEmployee(data);
    });
  }

  const offboardEmployee = () => {
    const inputIds = [
      'offboardEmployee__address',
    ];
    const inputs = inputIds.map((id) => document.getElementById(id) as HTMLInputElement);
    const addressOffboard = inputs[0].value;
    if (addressOffboard === '') {
      alert('Address is empty');
    }

    prepareWriteContract({
      address: addressService as '0x${string}',
      abi: Service.abi,
      functionName: 'removeEmployee',
      args: [addressOffboard],
      account: address,
    }).then((data) => {
      writeContract(data).then(() => {
        setTxData(['Adm2', data.result]);
      });
    }).catch(handleError);
  }

  const reinstateEmployee = () => {
    const inputIds = [
      'reinstateEmployee__address',
      'reinstateEmployee__role',
    ];
    const inputs = inputIds.map((id) => document.getElementById(id) as HTMLInputElement);
    const addressReinstate = inputs[0].value;
    const roleReinstate = inputs[1].value;
    if (addressReinstate === '') {
      alert('Address is empty');
    }

    prepareWriteContract({
      address: addressService as '0x${string}',
      abi: Service.abi,
      functionName: 'reinstateEmployee',
      args: [addressReinstate, parseInt(roleReinstate)],
      account: address,
    }).then((data) => {
      writeContract(data).then(() => {
        setTxData(['Adm3', data.result]);
      });
    }).catch(handleError);
  }

  const createID = () => {
    const inputIds = [
      'generateID__address',
      'generateID__firstName',
      'generateID__lastName',
      'generateID__birthPlace',
      'generateID__birthDate',
    ];
    const inputs = inputIds.map((id) => document.getElementById(id) as HTMLInputElement);
    const addressCreateID = inputs[0].value;
    const firstName = inputs[1].value;
    const lastName = inputs[2].value;
    const birthPlace = inputs[3].value;
    const birthDate = convertTimeToUnixEpochTime(inputs[4].value);
    if (inputs.some((input) => input.value === '')) {
      alert('Fill all inputs');
    }

    prepareWriteContract({
      address: addressService as '0x${string}',
      abi: Service.abi,
      functionName: 'generateId',
      args: [addressCreateID, firstName, lastName, birthDate, birthPlace],
      account: address,
    }).then((data) => {
      writeContract(data).then(() => {
        setTxData(['Mag1', data.result]);
      });
    }).catch(handleError);
  }

  const findID = () => {
    const inputIds = [
      'findID__address',
      'findID__id',
    ];
    const inputs = inputIds.map((id) => document.getElementById(id) as HTMLInputElement);
    const addressFindID = inputs[0].value;
    const idFindID = parseInt(inputs[1].value);
    if (addressFindID === '' && idFindID === 0) {
      alert('Fill one of the inputs');
    }

    if (addressFindID != '') {
      var numberIdAux: number = 0;
      readContract({
        address: addressService as '0x${string}',
        abi: Service.abi,
        functionName: 'getIDNumberByAddress',
        args: [addressFindID],
        account: address,
      }).then((data) => {
        numberIdAux = data as number;
      }).catch(handleError);
      readContract({
        address: addressService as '0x${string}',
        abi: Service.abi,
        functionName: 'getIDMetadataByAddress',
        args: [addressFindID],
        account: address,
      }).then((data) => {
        setIdmetadataFind([numberIdAux, data]);
      });

    } else {
      readContract({
        address: addressService as '0x${string}',
        abi: Service.abi,
        functionName: 'getIDMetadataByNumberID',
        args: [idFindID],
        account: address,
      }).then((data) => {
        setIdmetadataFind([idFindID, data]);
      }).catch(handleError);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Panel</title>
        <meta
          content="Generated by @rainbow-me/create-rainbowkit"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <header className={styles.header}>
        <ConnectButton />
        <Button colorScheme='blue' onClick={() => window.location.href = '/myId'}>My Id</Button>
      </header>

      <main className={styles.main}>
        {isClient && (
          <>
            {isConnected && employee ? (
              <div>
                {employee.firstName ? (
                  formatEmployeeData(employee)
                ) : (
                  <Card>
                    <CardBody
                      color={'red'}
                    >
                      <p>
                        You are not registered as an employee.
                      </p>
                    </CardBody>
                  </Card>
                )}
                <div
                  style={{
                    marginTop: '20px',
                  }}
                >
                  {parseInt(employee.egressDate) === 0 && (
                    <>
                      {employee.role === 1 ? (
                        <Card>
                          <CardBody>
                            <TextMenu text='Register new employee' />
                            <Input size='sm' type="text" placeholder="Address" id="newEmployee__address" />
                            <Input size='sm' type="text" placeholder="First Name" id="newEmployee__firstName" />
                            <Input size='sm' type="text" placeholder="Last Name" id="newEmployee__lastName" />
                            <Select size='sm' id="newEmployee__role">
                              <option value="0">Select Role</option>
                              <option value="1">Admin</option>
                              <option value="2">Manager</option>
                              <option value="3">Employee</option>
                            </Select>
                            <Box position='relative' paddingTop={2}>
                              <Button size='sm' colorScheme='blue' onClick={registerEmployee}>Register</Button>
                            </Box>
                            {txData && txData[0] === 'Adm1' && (
                              messageSuccess(`Registered employee with ID: ${txData[1].toString()}`)
                            )}

                            <TextMenu text='Offboard employee' />
                            <Input size='sm' type="text" placeholder="Address" id="offboardEmployee__address" />
                            <Box position='relative' paddingTop={2}>
                              <Button onClick={offboardEmployee} size='sm' colorScheme='red'>Offboard</Button>
                            </Box>
                            {txData && txData[0] === 'Adm2' && (
                              messageSuccess(`Offboarded employee`)
                            )}

                            <TextMenu text='Reinstate employee' />
                            <Input size='sm' type="text" placeholder="Address" id="reinstateEmployee__address" />
                            <Select size='sm' id="reinstateEmployee__role">
                              <option value="0">Select Role</option>
                              <option value="1">Admin</option>
                              <option value="2">Manager</option>
                              <option value="3">Employee</option>
                            </Select>
                            <Box position='relative' paddingTop={2}>
                              <Button onClick={reinstateEmployee} size='sm' colorScheme='green'>Reinstate</Button>
                            </Box>
                            {txData && txData[0] === 'Adm3' && (
                              messageSuccess(`Reinstated employee`)
                            )}

                            <TextMenu text='Find employee' />
                            {metadataFindEmployee ? (
                              <>
                                {metadataFindEmployee.firstName != '' ? (
                                  <>
                                    {formatEmployeeData(metadataFindEmployee)}
                                    <Button onClick={() => setMetadataFindEmployee(null)} size='sm' colorScheme='blue'>Clear</Button>
                                  </>
                                ) : (
                                  <>
                                    <strong>Employee don't exist</strong>
                                    <Button onClick={() => setMetadataFindEmployee(null)} size='sm' colorScheme='blue'>Clear</Button>
                                  </>
                                )}
                              </>
                            ) : (
                              <>
                                <Input size='sm' type="text" placeholder="Address" id="findEmployee__address" />
                                <Box position='relative' paddingTop={2}>
                                  <Button onClick={findEmployee} size='sm' colorScheme='blue'>Find</Button>
                                </Box>
                              </>
                            )}
                          </CardBody>
                        </Card>
                      ) : employee.role === 2 ? (
                        <Card>
                          <CardBody>
                            <TextMenu text='Generate ID' />
                            <Input size='sm' type="text" placeholder="To" id="generateID__address" />
                            <Input size='sm' type="text" placeholder="firstName" id="generateID__firstName" />
                            <Input size='sm' type="text" placeholder="lastName" id="generateID__lastName" />
                            <Input size='sm' type="text" placeholder="birthPlace" id="generateID__birthPlace" />
                            <Input size='sm' type="date" placeholder="birthDate" id="generateID__birthDate" />
                            <Box position='relative' paddingTop={2}>
                              <Button onClick={createID} size='sm' colorScheme='blue'>Generate</Button>
                            </Box>
                            {txData && txData[0] === 'Mag1' && (
                              messageSuccess(`Generated ID with ID: ${txData[1].toString()}`)
                            )}
                            <TextMenu text='Find employee' />
                          </CardBody>
                        </Card>
                      ) : employee.role === 3 && (
                        <Card>
                          <CardBody>
                            {idmetadataFind && idmetadataFind[0] === 0 ? (
                              <>
                                <TextMenu text='Find ID data' />
                                <Input size='sm' type="text" placeholder="Address" id="findID__address" />
                                <Center>Or</Center>
                                <Input size='sm' type="number" placeholder="Number ID" id="findID__id" />
                                <Box position='relative' paddingTop={2}>
                                  <Button onClick={findID} size='sm' colorScheme='blue'>Find</Button>
                                </Box>
                              </>
                            ) : (
                              <>
                                <p>Id: {idmetadataFind[0].toString()}</p>
                                <p>Name: {idmetadataFind[1].firstName} {idmetadataFind[1].lastName}</p>
                                <p>Birth Place: {idmetadataFind[1].birthPlace}</p>
                                <p>Birth Date: {formatUnixEpochTime(idmetadataFind[1].birthDate)}</p>
                                <Box position='relative' paddingTop={2}>
                                  <Button onClick={() => setIdmetadataFind([0, null])} size='sm' colorScheme='blue'>Clear</Button>
                                </Box>
                              </>
                            )}
                          </CardBody>
                        </Card>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Card
                  backgroundColor={'#de6d6d'}
                  color={'white'}
                >
                  <CardBody>
                    To get started, connect your wallet using the button above.
                  </CardBody>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div >
  );
};

export default Home;
