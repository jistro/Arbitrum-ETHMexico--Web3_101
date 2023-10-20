// SPDX-License-Identifier: CC-BY-4.0
pragma solidity ^0.8.19;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import {Data} from "./Data.sol";
contract Service is AccessControl {
    error Service__OnlyAdmin();
    error Service__OnlyManagerEmployee();
    error Service__OnlyGeneralEmployee();
    error Service__EmployeeExist();
    error Service__EmployeeNotExist();
    error Service__RoleNotValid();
    error Service__CantRemoveYourself();
    error Service__EmployeeAlreadyEgress();
    error Service__EmployeeIsStillActive();
    error Service__IDDontExist();
    error Service__AddressDoesntHaveIDAssigned();
    

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_EMPLOYEE_ROLE = keccak256("MANAGER_EMPLOYEE_ROLE");
    bytes32 public constant GENERAL_EMPLOYEE_ROLE = keccak256("GENERAL_EMPLOYEE_ROLE");

    address public DataAddress;

    uint256 public numberEmployee;

    struct EmployeeMetadata {
        string firstName;
        string lastName;
        uint256 idEmployee;
        uint8 role;
        uint256 ingressDate;
        uint256 egressDate;
    }

    mapping (address employeeAddress => EmployeeMetadata metadata) employee;

    constructor(
        address _DataAddress, 
        address _adminAddress,
        string memory _firstNameAdmin,
        string memory _lastNameAdmin
    ) {
        DataAddress = _DataAddress;
        _grantRole(ADMIN_ROLE, _adminAddress);
        numberEmployee++;
        employee[_adminAddress] = EmployeeMetadata(
            _firstNameAdmin,
            _lastNameAdmin,
            numberEmployee,
            1,
            block.timestamp,
            0
        );
    }

    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)){
            revert Service__OnlyAdmin();
        }
        _;
    }

    modifier onlyManagerEmployee() {
        if (!hasRole(MANAGER_EMPLOYEE_ROLE, msg.sender)){
            revert Service__OnlyManagerEmployee();
        }
        _;
    }

    modifier onlyEmployee() {
        if (!hasRole(GENERAL_EMPLOYEE_ROLE, msg.sender) && !hasRole(MANAGER_EMPLOYEE_ROLE, msg.sender)){
            revert Service__OnlyGeneralEmployee();
        }
        _;
    }

    function newEmployee(
        address _employeeAddress,
        string memory _firstName,
        string memory _lastName,
        uint8 _role
    ) public onlyAdmin returns (uint256) {
        if (employee[_employeeAddress].idEmployee != 0) {
            revert Service__EmployeeExist();
        }
        if (_role == 1) {
            _grantRole(ADMIN_ROLE, _employeeAddress);
        } else if (_role == 2) {
            _grantRole(MANAGER_EMPLOYEE_ROLE, _employeeAddress);
        } else if (_role == 3) {
            _grantRole(GENERAL_EMPLOYEE_ROLE, _employeeAddress);
        } else {
            revert Service__RoleNotValid();
        }
        numberEmployee++;
        employee[_employeeAddress] = EmployeeMetadata(
            _firstName,
            _lastName,
            numberEmployee,
            _role,
            block.timestamp,
            0
        );
        return numberEmployee;
    }

    function removeEmployee(address _employeeAddress) public onlyAdmin {
        if (_employeeAddress == msg.sender) {
            revert Service__CantRemoveYourself();
        }
        if (employee[_employeeAddress].idEmployee == 0) {
            revert Service__EmployeeNotExist();
        }
        if (employee[_employeeAddress].egressDate != 0) {
            revert Service__EmployeeAlreadyEgress();
        }
        if (employee[_employeeAddress].role == 1) {
            _revokeRole(ADMIN_ROLE, _employeeAddress);
        } else if (employee[_employeeAddress].role == 2) {
            _revokeRole(MANAGER_EMPLOYEE_ROLE, _employeeAddress);
        } else if (employee[_employeeAddress].role == 3) {
            _revokeRole(GENERAL_EMPLOYEE_ROLE, _employeeAddress);
        }
        employee[_employeeAddress].egressDate = block.timestamp;
    }

    function reinstateEmployee(address _employeeAddress, uint8 _role) public onlyAdmin {
        if (employee[_employeeAddress].idEmployee == 0) {
            revert Service__EmployeeNotExist();
        }
        if (employee[_employeeAddress].egressDate == 0) {
            revert Service__EmployeeIsStillActive();
        }
        if (_role == 1) {
            _grantRole(ADMIN_ROLE, _employeeAddress);
        } else if (_role == 2) {
            _grantRole(MANAGER_EMPLOYEE_ROLE, _employeeAddress);
        } else if (_role == 3) {
            _grantRole(GENERAL_EMPLOYEE_ROLE, _employeeAddress);
        } else {
            revert Service__RoleNotValid();
        }
        employee[_employeeAddress].role = _role;
        employee[_employeeAddress].egressDate = 0;
        employee[_employeeAddress].ingressDate = block.timestamp;
    }

    function getEmployee(address _employeeAddress) public view onlyAdmin returns (EmployeeMetadata memory) {
        return employee[_employeeAddress];
    }

    function getMyInfo() public view returns (EmployeeMetadata memory) {
        return employee[msg.sender];
    }

    function generateId(
        address _userAddress, 
        string memory _firstName, 
        string memory _lastName, 
        uint256 _birthDate, 
        string memory _birthPlace
    ) public onlyManagerEmployee returns (uint256) {
        return Data(DataAddress).generateID(
            _userAddress, 
            _firstName, 
            _lastName, 
            _birthDate, 
            _birthPlace
        );
    }

    function getIDNumberByAddress(
        address _userAddress
    ) public view onlyEmployee returns (uint256) {
        if (!Data(DataAddress).addressHasIdAssigned(_userAddress)) {
            revert Service__IDDontExist();
        }
        return Data(DataAddress).getIDNumberByAddress(_userAddress);
    }

    function getIDMetadataByAddress(
        address _userAddress
    ) public view onlyEmployee returns (Data.idMetadata memory) {
        if (!Data(DataAddress).addressHasIdAssigned(_userAddress)) {
            revert Service__IDDontExist();
        }
        return Data(DataAddress).getIDMetadataByAddress(_userAddress);
    }

    function getIDMetadataByNumberID(
        uint256 _numberID
    ) public view onlyEmployee returns (Data.idMetadata memory) {
        if (!Data(DataAddress).idNumberExist(_numberID)) {
            revert Service__IDDontExist();
        }
        return Data(DataAddress).getIDMetadataByNumberID(_numberID);
    }

} 