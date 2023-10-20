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
        (bool infoAdm, address admAdd)=data.grantAdminRole(address(service));
        (bool infodata, address dataAdd)=data.grantDataProviderRole(address(service));
        console2.log("Data address: ", address(data));
        console2.log("Service address: ", address(service));
        console2.log("Admin address: ", admAdd);
        console2.log("Data Provider address: ", dataAdd);
    }
}
