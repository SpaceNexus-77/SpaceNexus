// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title SpaceLoveLetter
 * @dev This is SpaceNexus's space postcard NFT contract
 * Postcards will be sent to space and returned to Earth, each postcard has a corresponding NFT
 */
contract SpaceLoveLetter is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Postcard status
    enum PostcardStatus { Created, LaunchedToSpace, ReturnedToEarth, MailedToOwner }
    
    struct Postcard {
        string content;       // Postcard content
        string imageURI;      // Image URI (IPFS hash)
        PostcardStatus status; // Current status
        uint256 launchDate;   // Launch date
        uint256 returnDate;   // Return date
        address creator;      // Creator address
    }
    
    // tokenId => Postcard mapping
    mapping(uint256 => Postcard) public postcards;
    
    // Postcard quantity limit per address
    uint256 public maxPostcardsPerAddress = 5;
    
    // address => number of created postcards
    mapping(address => uint256) public postcardCounts;
    
    // Postcard launch batch
    uint256 public currentLaunchBatch = 1;
    
    // batch => tokenId array
    mapping(uint256 => uint256[]) public launchBatches;
    
    // Events
    event PostcardCreated(uint256 indexed tokenId, address indexed creator, string content);
    event PostcardStatusUpdated(uint256 indexed tokenId, PostcardStatus newStatus);
    event BatchLaunched(uint256 indexed batchId, uint256 launchDate, uint256 postcardCount);
    event BatchReturned(uint256 indexed batchId, uint256 returnDate);
    
    constructor() ERC721("SpaceLoveLetter", "LETTER") {}
    
    /**
     * @dev Create new space postcard NFT
     * @param content Postcard content
     * @param imageURI Image URI
     * @return newly created tokenId
     */
    function createPostcard(string memory content, string memory imageURI) 
        public 
        returns (uint256) 
    {
        require(bytes(content).length > 0, "Content cannot be empty");
        require(bytes(imageURI).length > 0, "ImageURI cannot be empty");
        require(postcardCounts[msg.sender] < maxPostcardsPerAddress, "Exceeds max postcards per address");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, imageURI);
        
        postcards[newTokenId] = Postcard({
            content: content,
            imageURI: imageURI,
            status: PostcardStatus.Created,
            launchDate: 0,
            returnDate: 0,
            creator: msg.sender
        });
        
        postcardCounts[msg.sender]++;
        launchBatches[currentLaunchBatch].push(newTokenId);
        
        emit PostcardCreated(newTokenId, msg.sender, content);
        
        return newTokenId;
    }
    
    /**
     * @dev Update postcard status (owner only)
     * @param tokenId Postcard ID
     * @param newStatus New status
     */
    function updatePostcardStatus(uint256 tokenId, PostcardStatus newStatus) 
        external 
        onlyOwner 
    {
        require(_exists(tokenId), "Postcard does not exist");
        postcards[tokenId].status = newStatus;
        
        if (newStatus == PostcardStatus.LaunchedToSpace) {
            postcards[tokenId].launchDate = block.timestamp;
        } else if (newStatus == PostcardStatus.ReturnedToEarth) {
            postcards[tokenId].returnDate = block.timestamp;
        }
        
        emit PostcardStatusUpdated(tokenId, newStatus);
    }
    
    /**
     * @dev Start a new launch batch (owner only)
     */
    function startNewLaunchBatch() 
        external 
        onlyOwner 
    {
        currentLaunchBatch++;
    }
    
    /**
     * @dev Set batch status to launched (owner only)
     * @param batchId Batch ID
     */
    function launchBatch(uint256 batchId) 
        external 
        onlyOwner 
    {
        require(batchId > 0 && batchId <= currentLaunchBatch, "Invalid batch ID");
        uint256[] memory tokenIds = launchBatches[batchId];
        require(tokenIds.length > 0, "Batch is empty");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            postcards[tokenIds[i]].status = PostcardStatus.LaunchedToSpace;
            postcards[tokenIds[i]].launchDate = block.timestamp;
        }
        
        emit BatchLaunched(batchId, block.timestamp, tokenIds.length);
    }
    
    /**
     * @dev Set batch status to returned (owner only)
     * @param batchId Batch ID
     */
    function returnBatch(uint256 batchId) 
        external 
        onlyOwner 
    {
        require(batchId > 0 && batchId <= currentLaunchBatch, "Invalid batch ID");
        uint256[] memory tokenIds = launchBatches[batchId];
        require(tokenIds.length > 0, "Batch is empty");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            postcards[tokenIds[i]].status = PostcardStatus.ReturnedToEarth;
            postcards[tokenIds[i]].returnDate = block.timestamp;
        }
        
        emit BatchReturned(batchId, block.timestamp);
    }
    
    /**
     * @dev Get the number of postcards in a batch
     * @param batchId Batch ID
     * @return Number of postcards
     */
    function getBatchSize(uint256 batchId) 
        external 
        view 
        returns (uint256) 
    {
        require(batchId > 0 && batchId <= currentLaunchBatch, "Invalid batch ID");
        return launchBatches[batchId].length;
    }
    
    /**
     * @dev Set maximum number of postcards per address (owner only)
     * @param _maxPostcards New maximum number
     */
    function setMaxPostcardsPerAddress(uint256 _maxPostcards) 
        external 
        onlyOwner 
    {
        require(_maxPostcards > 0, "Max postcards must be positive");
        maxPostcardsPerAddress = _maxPostcards;
    }
    
    /**
     * @dev Get postcard details
     * @param tokenId Postcard ID
     * @return Postcard struct
     */
    function getPostcard(uint256 tokenId) 
        external 
        view 
        returns (Postcard memory) 
    {
        require(_exists(tokenId), "Postcard does not exist");
        return postcards[tokenId];
    }
    
    // Override necessary functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
} 