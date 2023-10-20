// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import { Data } from "../src/Data.sol";
import { Service } from "../src/Service.sol";

contract DeploySystemLocalScript is Script {
    Data data;
    Service service;

    address adminAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    function run() public {
        vm.startBroadcast(adminAddress);
        data = new Data(adminAddress);
        service = new Service(
            address(data), 
            adminAddress,
            "Cosme",
            "Fulanito de Tal"
            );
        service.newEmployee(
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            "Jose",
            "Perez",
            2
        );
        service.newEmployee(
            0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,
            "Juan",
            "Gonzalez",
            3
        );
        (bool infoAdm, address admAdd)=data.grantAdminRole(address(service));
        (bool infodata, address dataAdd)=data.grantDataProviderRole(address(service));
        console2.log("Data address: ", address(data));
        console2.log("Service address: ", address(service));
        console2.log("Admin address: ", admAdd);
        console2.log("Data Provider address: ", dataAdd);
    }
}
