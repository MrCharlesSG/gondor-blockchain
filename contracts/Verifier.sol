// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20207298691746492008693728524662731244195578639477698845299205015831902411862;
    uint256 constant alphay  = 2370824434794156300164591195938520668404825750474863281273506143023052490574;
    uint256 constant betax1  = 2308914939206864369591584288026702298922129219601010958962150133222543027101;
    uint256 constant betax2  = 19764437813134976714682594901809610988157481072823387667499388890512964525506;
    uint256 constant betay1  = 10869344212845938930813145999175948829971426256503223059491427000383053775995;
    uint256 constant betay2  = 16290986924750933585809610102004046252215072257511162903076749117897677315760;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 17348379998633855965194976653011713108132481277240339195417366687834203812663;
    uint256 constant deltax2 = 16357524116278306213333301439620059884712400462543075730728182791255002234740;
    uint256 constant deltay1 = 7548005316667191845576329609635500078629614258363433896672341736112990194210;
    uint256 constant deltay2 = 7707829263698609599068215269834777216015418952490148308423935405536183762223;

    
    uint256 constant IC0x = 2188601769113200141966844491017090857997022582183707702089980554884136475508;
    uint256 constant IC0y = 13649690657255292733396971779632537991230642521636026564708212916771653106230;
    
    uint256 constant IC1x = 11802009077188293772396891974484228464124336488757471324513225994573796025525;
    uint256 constant IC1y = 17285859013187308271845658951970966061829252179518370399264437914271870341266;
    
    uint256 constant IC2x = 7425284330198429614416229154350343227283800928196560184373989926438584685026;
    uint256 constant IC2y = 16811514125685564108232474804174035476724045161877672562933004986329867772934;
    
    uint256 constant IC3x = 1823770585768178498154717316438072961633702604582963959449995567265555567372;
    uint256 constant IC3y = 1986623373262923940646131091119698039601910394898838526301428184664758220727;
    
    uint256 constant IC4x = 16959484538196969045884134749547982401674689724740843452029927246061189324977;
    uint256 constant IC4y = 14483905397703052750872086474584003582464564711599556251014341128023862609635;
    
    uint256 constant IC5x = 12156781348836142880030511540594268786126109971907108577470454338820639618434;
    uint256 constant IC5y = 10123173488010294990742571626807944288720005803346726623077236837564009315640;
    
    uint256 constant IC6x = 17678915651356025718966825839673167684243099534615584285286257639589628361922;
    uint256 constant IC6y = 20339970500402758087450911538746247897151103309359007257016916380133738996118;
    
    uint256 constant IC7x = 13749945331427565634304986413153422090193266723875934347781406754782329386325;
    uint256 constant IC7y = 2674936665075270044239853581756165293780005286345356589337167235333652391783;
    
    uint256 constant IC8x = 11608253363313365373558505048919066973068379624877452987428376671450586476189;
    uint256 constant IC8y = 8666732537356600959379185961929758014826413725260944475565154427426854244749;
    
    uint256 constant IC9x = 19929570224464590271757687084756948829174102580935911315833819292724472535390;
    uint256 constant IC9y = 9303883609338209100852343172077499857058709649016324450796709147251069686375;
    
    uint256 constant IC10x = 8308072282634054399956818817783932175215035534503373817782689057787106342291;
    uint256 constant IC10y = 6771082239951252910814901773321718149799332878935816459591629653194932076838;
    
    uint256 constant IC11x = 7899982514053511926057035618409385166114831685129321088294141011995854639541;
    uint256 constant IC11y = 11189902956984114306189527425748216553025064163493627421523251050769797536381;
    
    uint256 constant IC12x = 2743178880098003040195953207173174700228060477951688342125676061904527246174;
    uint256 constant IC12y = 10292645140085148830074378282323403353573227263790678007880242287158062379567;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[12] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                
                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))
                
                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))
                
                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))
                
                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))
                
                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            
            checkField(calldataload(add(_pubSignals, 256)))
            
            checkField(calldataload(add(_pubSignals, 288)))
            
            checkField(calldataload(add(_pubSignals, 320)))
            
            checkField(calldataload(add(_pubSignals, 352)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
