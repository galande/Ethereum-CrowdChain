pragma solidity ^0.4.17;

contract CampaignFactory{

    address[] public deployedContracts;

    function createCampaign(uint minimum) public  {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedContracts.push(newCampaign);
    }

    function getDeployedContracts() public view returns(address[]){
        return deployedContracts;
    }
}

contract Campaign{

    struct Request{
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approveCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    uint public approversCount;
    mapping(address => bool) public approvers;

    modifier onlyManager(){
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable{
        require(msg.value > minimumContribution);

        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(string description, uint value, address recipient) public onlyManager {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approveCount:0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public{
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approveCount++;
    }

    function finalizeRequest(uint index) public onlyManager {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.approveCount > (approversCount/2));

        request.recipient.transfer(request.value);
        request.complete = true;
    }
}
