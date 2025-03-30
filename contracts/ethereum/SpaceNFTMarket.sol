// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SpaceNFTMarket
 * @dev SpaceNexus的NFT交易市场，用于交易太空相关的NFT资产
 */
contract SpaceNFTMarket is ReentrancyGuard, Ownable {
    // $SPACE代币合约地址
    IERC20 public spaceToken;
    
    // 挂单结构体
    struct Listing {
        address seller;     // 卖家地址
        uint256 price;      // 价格（以$SPACE代币计价）
        bool active;        // 是否有效
    }
    
    // NFT合约地址 => NFT ID => 挂单信息
    mapping(address => mapping(uint256 => Listing)) public listings;
    
    // 平台费率（2.5%）
    uint256 public feePercentage = 25;
    uint256 public constant FEE_DENOMINATOR = 1000;
    
    // 累计交易量
    uint256 public totalVolume;
    
    // 累计费用收入
    uint256 public totalFees;
    
    // 用户交易量
    mapping(address => uint256) public userVolume;
    
    // NFT合约白名单
    mapping(address => bool) public whitelistedNFTs;
    
    // 事件
    event NFTListed(address indexed nftContract, uint256 indexed tokenId, uint256 price, address indexed seller);
    event NFTSold(address indexed nftContract, uint256 indexed tokenId, uint256 price, address seller, address buyer);
    event NFTListingCanceled(address indexed nftContract, uint256 indexed tokenId, address indexed seller);
    event FeePercentageUpdated(uint256 newFeePercentage);
    event NFTContractWhitelisted(address indexed nftContract, bool status);
    event SpaceTokenUpdated(address indexed newSpaceToken);
    
    /**
     * @dev 构造函数
     * @param _spaceToken $SPACE代币合约地址
     */
    constructor(address _spaceToken) {
        require(_spaceToken != address(0), "Invalid token address");
        spaceToken = IERC20(_spaceToken);
    }
    
    /**
     * @dev 挂单出售NFT
     * @param nftContract NFT合约地址
     * @param tokenId NFT ID
     * @param price 价格（以$SPACE代币计价）
     */
    function listNFT(address nftContract, uint256 tokenId, uint256 price) external {
        require(whitelistedNFTs[nftContract], "NFT contract not whitelisted");
        require(price > 0, "Price must be greater than zero");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the NFT owner");
        require(nft.isApprovedForAll(msg.sender, address(this)), "Market not approved");
        
        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
        
        emit NFTListed(nftContract, tokenId, price, msg.sender);
    }
    
    /**
     * @dev 购买NFT
     * @param nftContract NFT合约地址
     * @param tokenId NFT ID
     */
    function buyNFT(address nftContract, uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "NFT not listed");
        require(listing.seller != msg.sender, "Cannot buy your own NFT");
        
        // 计算平台费用
        uint256 fee = (listing.price * feePercentage) / FEE_DENOMINATOR;
        uint256 sellerAmount = listing.price - fee;
        
        // 更新挂单状态
        listings[nftContract][tokenId].active = false;
        
        // 更新交易量统计
        totalVolume += listing.price;
        totalFees += fee;
        userVolume[msg.sender] += listing.price;
        userVolume[listing.seller] += listing.price;
        
        // 转移代币
        require(spaceToken.transferFrom(msg.sender, listing.seller, sellerAmount), "Token transfer to seller failed");
        require(spaceToken.transferFrom(msg.sender, owner(), fee), "Fee transfer failed");
        
        // 转移NFT
        IERC721(nftContract).safeTransferFrom(listing.seller, msg.sender, tokenId);
        
        emit NFTSold(nftContract, tokenId, listing.price, listing.seller, msg.sender);
    }
    
    /**
     * @dev 取消NFT挂单
     * @param nftContract NFT合约地址
     * @param tokenId NFT ID
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "NFT not listed");
        require(listing.seller == msg.sender || owner() == msg.sender, "Not the seller or owner");
        
        listings[nftContract][tokenId].active = false;
        
        emit NFTListingCanceled(nftContract, tokenId, listing.seller);
    }
    
    /**
     * @dev 更新NFT价格
     * @param nftContract NFT合约地址
     * @param tokenId NFT ID
     * @param newPrice 新价格
     */
    function updateListingPrice(address nftContract, uint256 tokenId, uint256 newPrice) external {
        require(newPrice > 0, "Price must be greater than zero");
        
        Listing memory listing = listings[nftContract][tokenId];
        require(listing.active, "NFT not listed");
        require(listing.seller == msg.sender, "Not the seller");
        
        listings[nftContract][tokenId].price = newPrice;
        
        emit NFTListed(nftContract, tokenId, newPrice, msg.sender);
    }
    
    /**
     * @dev 设置平台费率（仅限所有者）
     * @param _feePercentage 新的费率（基数为1000）
     */
    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 50, "Fee too high"); // 最高5%
        feePercentage = _feePercentage;
        
        emit FeePercentageUpdated(_feePercentage);
    }
    
    /**
     * @dev 添加或移除NFT合约白名单（仅限所有者）
     * @param nftContract NFT合约地址
     * @param status 是否加入白名单
     */
    function setNFTContractWhitelisted(address nftContract, bool status) external onlyOwner {
        whitelistedNFTs[nftContract] = status;
        
        emit NFTContractWhitelisted(nftContract, status);
    }
    
    /**
     * @dev 更新$SPACE代币合约地址（仅限所有者）
     * @param _spaceToken 新的代币合约地址
     */
    function updateSpaceToken(address _spaceToken) external onlyOwner {
        require(_spaceToken != address(0), "Invalid token address");
        spaceToken = IERC20(_spaceToken);
        
        emit SpaceTokenUpdated(_spaceToken);
    }
    
    /**
     * @dev 提取平台费用（仅限所有者）
     * @param to 接收地址
     * @param amount 提取金额
     */
    function withdrawFees(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        require(amount > 0, "Amount must be greater than zero");
        
        bool success = spaceToken.transfer(to, amount);
        require(success, "Transfer failed");
    }
    
    /**
     * @dev 获取用户NFT挂单列表
     * @param user 用户地址
     * @param nftContract NFT合约地址
     * @return tokenIds NFT ID数组
     * @return prices 价格数组
     */
    function getUserListings(address user, address nftContract) external view returns (uint256[] memory, uint256[] memory) {
        // 计算该用户在特定NFT合约上的挂单数量
        uint256 count = 0;
        uint256 totalSupply = IERC721(nftContract).balanceOf(user);
        
        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = i; // 简化模型，实际需要通过合约查询
            if (listings[nftContract][tokenId].active && listings[nftContract][tokenId].seller == user) {
                count++;
            }
        }
        
        // 构建结果数组
        uint256[] memory tokenIds = new uint256[](count);
        uint256[] memory prices = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = i; // 简化模型，实际需要通过合约查询
            if (listings[nftContract][tokenId].active && listings[nftContract][tokenId].seller == user) {
                tokenIds[index] = tokenId;
                prices[index] = listings[nftContract][tokenId].price;
                index++;
            }
        }
        
        return (tokenIds, prices);
    }
} 