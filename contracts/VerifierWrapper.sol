// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GondorSovereignIdentity.sol";

interface ISnarkJSVerifier {
    function verifyProof(
        uint256[2] calldata _pA, 
        uint256[2][2] calldata _pB, 
        uint256[2] calldata _pC, 
        uint256[12] calldata _pubSignals
    ) external view returns (bool);
}

contract VerifierWrapper is IGondorVerifier {
    ISnarkJSVerifier public immutable snarkjsVerifier;

    constructor(address _verifier) {
        snarkjsVerifier = ISnarkJSVerifier(_verifier);
    }

    function verifyProof(
        bytes calldata proof, 
        uint256 tokenId, 
        uint256 oldTotalRevenue, 
        uint256 oldTotalCostInvested, 
        uint256 oldTotalCostRealized,
        uint256 newTotalRevenue, 
        uint256 newTotalCostInvested, 
        uint256 newTotalCostRealized,
        bytes32[] calldata roots
    ) external view override returns (bool) {
        // Decode the proof bytes into pA, pB, pC
        (uint256[2] memory pA, uint256[2][2] memory pB, uint256[2] memory pC) = 
            abi.decode(proof, (uint256[2], uint256[2][2], uint256[2]));

        // Construct public signals array
        // Order of pubSignals matches the circuit public inputs:
        // [tokenId, oldTotalRevenue, oldTotalCostInvested, oldTotalCostRealized, newTotalRevenue, newTotalCostInvested, newTotalCostRealized, root[5]]
        uint256[12] memory pubSignals;
        pubSignals[0] = tokenId;
        pubSignals[1] = oldTotalRevenue;
        pubSignals[2] = oldTotalCostInvested;
        pubSignals[3] = oldTotalCostRealized;
        pubSignals[4] = newTotalRevenue;
        pubSignals[5] = newTotalCostInvested;
        pubSignals[6] = newTotalCostRealized;
        
        require(roots.length == 5, "VerifierWrapper: roots length must be 5");
        for (uint256 i = 0; i < 5; i++) {
            pubSignals[7 + i] = uint256(roots[i]);
        }

        return snarkjsVerifier.verifyProof(pA, pB, pC, pubSignals);
    }
}
