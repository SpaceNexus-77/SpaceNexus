// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SpaceExperimentData
 * @dev This contract is used to store and verify space experiment data on the blockchain
 */
contract SpaceExperimentData is AccessControl {
    bytes32 public constant SCIENTIST_ROLE = keccak256("SCIENTIST_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Experiment struct
    struct Experiment {
        string name;            // Experiment name
        string description;     // Experiment description
        string ipfsDataHash;    // Data hash on IPFS
        uint256 timestamp;      // Record timestamp
        address scientist;      // Scientist address
        bool verified;          // Whether verified
    }
    
    // All experiments
    Experiment[] public experiments;
    
    // Experiment type => Experiment ID array
    mapping(string => uint256[]) public experimentsByType;
    
    // Scientist address => Experiment ID array
    mapping(address => uint256[]) public scientistExperiments;
    
    // Events
    event ExperimentAdded(uint256 indexed id, string name, address indexed scientist);
    event ExperimentVerified(uint256 indexed id, bool verified);
    event ScientistAdded(address indexed scientist);
    event ScientistRemoved(address indexed scientist);
    
    /**
     * @dev Constructor
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Add experiment data
     * @param name Experiment name
     * @param description Experiment description
     * @param experimentType Experiment type
     * @param ipfsDataHash IPFS data hash
     * @return Experiment ID
     */
    function addExperiment(
        string memory name,
        string memory description,
        string memory experimentType,
        string memory ipfsDataHash
    ) 
        external
        onlyRole(SCIENTIST_ROLE)
        returns (uint256)
    {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(experimentType).length > 0, "Type cannot be empty");
        require(bytes(ipfsDataHash).length > 0, "IPFS hash cannot be empty");
        
        uint256 id = experiments.length;
        
        experiments.push(Experiment({
            name: name,
            description: description,
            ipfsDataHash: ipfsDataHash,
            timestamp: block.timestamp,
            scientist: msg.sender,
            verified: false
        }));
        
        experimentsByType[experimentType].push(id);
        scientistExperiments[msg.sender].push(id);
        
        emit ExperimentAdded(id, name, msg.sender);
        
        return id;
    }
    
    /**
     * @dev Verify experiment (admin only)
     * @param id Experiment ID
     * @param verified Verification status
     */
    function verifyExperiment(uint256 id, bool verified) 
        external
        onlyRole(ADMIN_ROLE)
    {
        require(id < experiments.length, "Experiment does not exist");
        experiments[id].verified = verified;
        
        emit ExperimentVerified(id, verified);
    }
    
    /**
     * @dev Get total experiment count
     * @return Number of experiments
     */
    function getExperimentCount() external view returns (uint256) {
        return experiments.length;
    }
    
    /**
     * @dev Get experiments by type
     * @param experimentType Experiment type
     * @return Array of experiment IDs
     */
    function getExperimentsByType(string memory experimentType) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return experimentsByType[experimentType];
    }
    
    /**
     * @dev Get scientist's experiments
     * @param scientist Scientist address
     * @return Array of experiment IDs
     */
    function getScientistExperiments(address scientist) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return scientistExperiments[scientist];
    }
    
    /**
     * @dev Add scientist role (admin only)
     * @param scientist Scientist address
     */
    function addScientist(address scientist) 
        external
        onlyRole(ADMIN_ROLE)
    {
        require(scientist != address(0), "Invalid address");
        grantRole(SCIENTIST_ROLE, scientist);
        
        emit ScientistAdded(scientist);
    }
    
    /**
     * @dev Remove scientist role (admin only)
     * @param scientist Scientist address
     */
    function removeScientist(address scientist) 
        external
        onlyRole(ADMIN_ROLE)
    {
        require(scientist != address(0), "Invalid address");
        revokeRole(SCIENTIST_ROLE, scientist);
        
        emit ScientistRemoved(scientist);
    }
    
    /**
     * @dev Get experiment details
     * @param id Experiment ID
     * @return Experiment struct
     */
    function getExperiment(uint256 id) 
        external 
        view 
        returns (Experiment memory) 
    {
        require(id < experiments.length, "Experiment does not exist");
        return experiments[id];
    }
    
    /**
     * @dev Get verified experiments of a specific type
     * @param experimentType Experiment type
     * @return Array of experiment IDs
     */
    function getVerifiedExperimentsByType(string memory experimentType) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory typeExperiments = experimentsByType[experimentType];
        uint256 verifiedCount = 0;
        
        // Calculate the number of verified experiments
        for (uint256 i = 0; i < typeExperiments.length; i++) {
            if (experiments[typeExperiments[i]].verified) {
                verifiedCount++;
            }
        }
        
        // Create result array
        uint256[] memory result = new uint256[](verifiedCount);
        uint256 resultIndex = 0;
        
        // Fill result array
        for (uint256 i = 0; i < typeExperiments.length; i++) {
            if (experiments[typeExperiments[i]].verified) {
                result[resultIndex] = typeExperiments[i];
                resultIndex++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Check if an address is a scientist
     * @param account Address to check
     * @return Whether the address is a scientist
     */
    function isScientist(address account) external view returns (bool) {
        return hasRole(SCIENTIST_ROLE, account);
    }
    
    /**
     * @dev Check if an address is an admin
     * @param account Address to check
     * @return Whether the address is an admin
     */
    function isAdmin(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }
} 