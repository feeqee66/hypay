// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    address public owner; // Deployer of the contract (the buyer)
    address public farmer; // Farmer's address to receive payments
    uint256 public contractBalance; // Track contract balance

    struct Milestone {
        uint256 amount; // Amount for the milestone
        bool released;  // Whether the payment for this milestone has been released
    }

    Milestone[] public milestones; // Array of milestones

    event Deposited(address indexed buyer, uint256 amount);
    event MilestoneAdded(uint256 milestoneIndex, uint256 amount);
    event PaymentReleased(address indexed farmer, uint256 amount);
    event MilestoneReleased(uint256 milestoneIndex, uint256 amount);

    constructor(address _farmer) {
        owner = msg.sender; // Set deployer as owner
        farmer = _farmer; // Set farmer's address
    }

    // Function to deposit ETH to the contract
    function deposit() public payable {
        require(msg.value > 0, "Deposit must be greater than zero");
        contractBalance += msg.value; // Track balance
        emit Deposited(msg.sender, msg.value);
    }

    // Function to add a milestone with the specified amount to be released
    function addMilestone(uint256 _amount) public {
        require(msg.sender == owner, "Only owner can add milestones");
        require(_amount > 0, "Amount must be greater than zero");
        require(contractBalance >= _amount, "Contract balance does not cover full deposit");

        milestones.push(Milestone({
            amount: _amount,
            released: false
        }));

        emit MilestoneAdded(milestones.length - 1, _amount);
    }

    // Function to release payment for a specific milestone
    function releasePayment(uint256 milestoneIndex) public {
        require(msg.sender == owner, "Only owner can release payment");
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        require(!milestones[milestoneIndex].released, "Milestone already released");
        require(contractBalance >= milestones[milestoneIndex].amount, "Contract balance does not cover payment");

        uint256 amountToRelease = milestones[milestoneIndex].amount;
        milestones[milestoneIndex].released = true;
        contractBalance -= amountToRelease; // Update contract balance

        payable(farmer).transfer(amountToRelease);
        emit MilestoneReleased(milestoneIndex, amountToRelease);
        emit PaymentReleased(farmer, amountToRelease);
    }

    // Function to get the contract balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Function to get the total number of milestones
    function getMilestoneCount() public view returns (uint256) {
        return milestones.length;
    }

    // Function to get details of a specific milestone
    function getMilestone(uint256 milestoneIndex) public view returns (uint256 amount, bool released) {
        require(milestoneIndex < milestones.length, "Invalid milestone index");
        Milestone storage milestone = milestones[milestoneIndex];
        return (milestone.amount, milestone.released);
    }
}

