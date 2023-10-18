// SPDX-License-Identifier: CC-BY-4.0
pragma solidity ^0.8.19;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract Data is AccessControl {

    error Data__OnlyAdmin();
    error Data__OnlyDataProvider();
    error Data__IDAlreadyExist();
    error Data__IDDoesNotExist();
    error Data__CantRevokeYourself();

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DATA_PROVIDER_ROLE = keccak256("DATA_PROVIDER_ROLE");

    uint256 public numberID;

    struct idMetadata {
        string firstName;
        string lastName;
        uint256 birthDate;
        string birthPlace;
    }

    mapping (uint numberID => idMetadata metadata) idUser;

    mapping (address userAddress => uint numberID) user;

    event Data__newID(
        uint numberID, 
        address userAddress
    );
    event Data__updateID(
        uint numberID, 
        address userAddress
    );
    event Data__newAdmin(
        address adminAddress,
        uint256 date
    );
    event Data__newDataProvider(
        address dataProviderAddress,
        uint256 date
    );
    event Data__removeAdmin(
        address adminAddress,
        uint256 date
    );
    event Data__removeDataProvider(
        address dataProviderAddress,
        uint256 date
    );

    constructor( address _adminAddress, address _dataProviderAddress) {
        _grantRole(ADMIN_ROLE, _adminAddress);
        _grantRole(DATA_PROVIDER_ROLE, _dataProviderAddress);
    }

    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) {
            revert Data__OnlyAdmin();
        }
        _;
    }

    modifier onlyDataProvider() {
        if (!hasRole(DATA_PROVIDER_ROLE, msg.sender)) {
            revert Data__OnlyDataProvider();
        }
        _;
    }

    function grantAdminRole(address _adminAddress) public onlyAdmin {
        _grantRole(ADMIN_ROLE, _adminAddress);
        emit Data__newAdmin(_adminAddress, block.timestamp);
    }

    function grantDataProviderRole(address _dataProviderAddress) public onlyAdmin {
        _grantRole(DATA_PROVIDER_ROLE, _dataProviderAddress);
        emit Data__newDataProvider(_dataProviderAddress, block.timestamp);
    }

    function revokeAdminRole(address _adminAddress) public onlyAdmin {
        if (msg.sender == _adminAddress){
            revert Data__CantRevokeYourself();
        }
        _revokeRole(ADMIN_ROLE, _adminAddress);
        emit Data__removeAdmin(_adminAddress, block.timestamp);
    }

    function revokeDataProviderRole(address _dataProviderAddress) public onlyAdmin {
        _revokeRole(DATA_PROVIDER_ROLE, _dataProviderAddress);
        emit Data__removeDataProvider(_dataProviderAddress, block.timestamp);
    }

    function generateID(
        address userAddress, 
        string memory firstName, 
        string memory lastName, 
        uint256 birthDate, 
        string memory birthPlace
    ) public onlyDataProvider returns (uint256) {
        numberID++;
        idUser[numberID] = idMetadata(firstName, lastName, birthDate, birthPlace);
        user[userAddress] = numberID;
        emit Data__newID(numberID, userAddress);
        return numberID;
    }

    function myID() public view onlyDataProvider returns (idMetadata memory, uint256) {
        return (idUser[user[msg.sender]], user[msg.sender]);
    }

    function getIDNumberByAddress(address _userAddress) public view onlyDataProvider returns (uint256) {
        return user[_userAddress];
    }

    function getIDMetadataByAddress(address _userAddress) public view onlyDataProvider returns (idMetadata memory) {
        return idUser[user[_userAddress]];
    }

    function getIDMetadataByNumberID(uint256 _numberID) public view onlyDataProvider returns (idMetadata memory) {
        return idUser[_numberID];
    }

    function idNumberExist(uint256 _numberID) public view returns (bool) {
        if (idUser[_numberID].birthDate == 0) {
            return false;
        }
        return true;
    }

    function isOwnerOfID(address _userAddress, uint256 _numberID) public view returns (bool) {
        if (user[_userAddress] == _numberID) {
            return true;
        }
        return false;
    }

    function addressHasIdAssigned(address _userAddress) public view returns (bool) {
        if (user[_userAddress] == 0) {
            return false;
        }
        return true;
    }

}
