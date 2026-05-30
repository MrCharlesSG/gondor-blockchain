// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockVerifier {
    bool public nextResult = true;

    function setNextResult(bool _result) public {
        nextResult = _result;
    }

    function verifyProof(
        bytes calldata, 
        uint256, 
        uint256, 
        uint256, 
        uint256, 
        uint256, 
        uint256, 
        bytes32[] calldata
    ) external view returns (bool) {
        return nextResult;
    }
}
