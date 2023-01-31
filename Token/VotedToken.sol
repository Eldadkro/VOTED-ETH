// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract VotedToken { 

    // makes them constant to reduce cost as they are eevaluated at compilation time
    string public constant _name = "VotedToken";
    string public constant _symbol = "vote";
    uint8 public constant _decimals = 1;
    uint256 public _total = 0;
    address public owner;

    uint public starting_block; // number of the first block
    uint public starting_time; // time of the first block of the vote in [ms]
    uint public length; // [ms]

    address[] public ballots_addr;
    struct Ballot {
        bool is_Ballot;
        string name;
        uint256 votes;
    }

    struct Voter {
        bool voted;
        address voted_to;
        bool is_a_voter;
    }

    mapping (address=>Ballot) public ballots;
    mapping (address => Voter) internal voters;

    //TODO make events for voting, and creating

    event Vote(address ballot);
    event NewVoter(uint256 total);

    constructor(uint _length,address[] memory addrs,string[] memory names) {
        require(names.length == addrs.length,"not same length");
        starting_block = block.number;
        starting_time = block.timestamp;
        owner = msg.sender;
        length = _length;
        for(uint i=0;i<addrs.length;i++){
            ballots[addrs[i]].name = names[i];
            ballots[addrs[i]].is_Ballot = true;
        } 
        ballots_addr = addrs;
    }

    function totalVoters() public view returns (uint256){
        return _total;
    }

    function votingRights(address who) public view returns (bool){
        require(voters[who].is_a_voter ==true,"is a voter");
        return voters[who].voted;
    }

    function ballot(address addr) public view returns (string memory name, uint256 votes){
        require(ballots[addr].is_Ballot == true,"is a ballot");
        name = ballots[addr].name;
        votes = ballots[addr].votes;
    }

    function vote(address to) external returns (bool){
        //dest needs to be a ballot
        require(ballots[to].is_Ballot == true,"destination is not a ballot");
        //needs to have a voting right
        require(voters[msg.sender].is_a_voter == true,"doesn't have voting rights");
        //cannot have voeted before
        require(voters[msg.sender].voted == false,"cannot have voeted before");
        //cannot vote for address 0 
        require(to != address(0),"cannot vote for address 0");
        //cannot vote after the end
        require(length+starting_time >= block.timestamp,"cannot vote after the end");

        ballots[to].votes += 1;
        voters[msg.sender].voted = true;
        voters[msg.sender].voted_to = to;
        emit Vote(to);
        return true;
    }


    function createVoter(address newVoter) external returns (bool){
        //only the owner can add a voter
        require(msg.sender == owner,"only owner can add a new voter");
        //you cannot add a voter that was already registerd
        require(voters[newVoter].is_a_voter == false,"cannot add existing voter");

        voters[newVoter].is_a_voter = true;
        voters[newVoter].voted = false;
        voters[newVoter].voted_to = address(0); 
        _total += 1;
        emit NewVoter(_total);
        return true;
    } 
}