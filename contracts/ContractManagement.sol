// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract OptimizedEscrow {
    // Packed struct to reduce storage slots and gas costs
    struct Milestone {
        bytes32 description; // Use bytes32 instead of string to save gas
        uint96 amount; // Reduce uint256 to uint96 (enough for most use cases)
    }

    // Packed struct to minimize storage slots
    struct PaymentDetails {
        bytes32 transactionId; // Use bytes32 for more gas-efficient storage
        bytes32 userName; // Convert string to bytes32
        bytes32 orderId; // Convert string to bytes32
        uint96 amount; // Reduced from uint256
    }

    // Use immutable for owner to save gas on access
    address public immutable owner;

    // Use a single storage slot for PaymentDetails
    PaymentDetails private _paymentDetails;

    // Optimized array storage with fixed-size array for milestones
    Milestone[10] private _milestones; // Limit to 10 milestones to reduce gas
    uint8 private _milestoneCount;

    // Custom error for more gas-efficient error handling
    error Unauthorized();
    error MilestoneLimitExceeded();

    constructor() {
        owner = msg.sender;
    }

   
    function storeAllDetails(
        bytes32 transactionId,
        uint96 amount,
        bytes32 userName,
        bytes32 orderId,
        Milestone[] memory milestoneData
    ) external {
        // Use custom error for gas-efficient checking
        if (msg.sender != owner) revert Unauthorized();
        
        // Check milestone count to prevent excessive gas consumption
        if (milestoneData.length > 10) revert MilestoneLimitExceeded();

        // Store payment details in a single, packed storage slot
        _paymentDetails = PaymentDetails({
            transactionId: transactionId,
            amount: amount,
            userName: userName,
            orderId: orderId
        });

        // Efficiently store milestones
        _milestoneCount = uint8(milestoneData.length);
        for (uint8 i; i < milestoneData.length; ) {
            _milestones[i] = milestoneData[i];
            unchecked { ++i; } // Gas optimization for loop increment
        }
    }

    function getPaymentDetails() external view returns (
        bytes32 transactionId,
        uint96 amount,
        bytes32 userName,
        bytes32 orderId
    ) {
        PaymentDetails memory details = _paymentDetails;
        return (
            details.transactionId,
            details.amount,
            details.userName,
            details.orderId
        );
    }

  
    function getMilestones() external view returns (Milestone[] memory) {
        Milestone[] memory milestones = new Milestone[](_milestoneCount);
        for (uint8 i; i < _milestoneCount; ) {
            milestones[i] = _milestones[i];
            unchecked { ++i; }
        }
        return milestones;
    }

   
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Fallback function to receive Ether
    receive() external payable {}
}