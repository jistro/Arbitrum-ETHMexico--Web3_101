// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {Data} from "../src/Data.sol";
import {Service} from "../src/Service.sol";

contract DeploySystemScript is Script {
    Data data;
    Service service;

    address adminAddress = 0xF11f8301C76F46733d855ac767BE741FFA9243Bd;
    string firstName = "Kevin";
    string lastName = "Padilla";

    function run() public {
        vm.startBroadcast(adminAddress);
        data = new Data(adminAddress);
        service = new Service(
            address(data), 
            adminAddress,
            firstName,
            lastName
            );
        (bool infoAdm, address admAdd) = data.grantAdminRole(address(service));
        (bool infodata, address dataAdd) = data.grantDataProviderRole(address(service));
        console2.log("Data address: ", address(data));
        console2.log("Service address: ", address(service));
        console2.log("Admin address: ", admAdd);
        console2.log("Data Provider address: ", dataAdd);
    }
}
