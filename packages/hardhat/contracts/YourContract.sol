pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC721Enumerable } from "@openzeppelin/contracts/interfaces/IERC721Enumerable.sol";
import { ERC721Enumerable } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol
contract BitCorn is ERC20, Ownable {

    constructor() ERC20("BitCorn", "CORN") {}

    function freeCorn() public {
        _mint(msg.sender, 100 ether);
    }
}

contract Tix is ERC721, ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Tix", "TIX") {
    }

    function tokensByAddress(address owner) public view returns (uint256[] memory) {
        uint256 bal = balanceOf(owner);
        uint256[] memory ids = new uint256[](bal);
        for (uint256 i; i < bal; i++) {
          ids[i] = tokenOfOwnerByIndex(owner, i);
        }
        return ids;
    }

    function mint(address player) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(player, newItemId);

        return newItemId;
    }
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
      internal
      override(ERC721, ERC721Enumerable)
    {
      super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
      public
      view
      override(ERC721, ERC721Enumerable)
      returns (bool)
    {
      return super.supportsInterface(interfaceId);
    }

}

contract DealerKey is ERC721, ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("KEY", "DealerKey") {
    }

    function mint() public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);

        return newItemId;
    }
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
      internal
      override(ERC721, ERC721Enumerable)
    {
      super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
      public
      view
      override(ERC721, ERC721Enumerable)
      returns (bool)
    {
      return super.supportsInterface(interfaceId);
    }

}

contract Plottery is Ownable {

  // event SetPurpose(address sender, string purpose);

  string public purpose = "Building Unstoppable Apps!!!";
  IERC721Enumerable public tixToken;
  IERC721Enumerable public dealerToken;
  IERC20 public winToken; // also forSale token
  bytes32 private _secretHash;
  bool public canEnter;
  uint256 public futureBlockNumber;
  bytes32 public stashedHash;
  uint256[] public entries;
  uint256 public tixSalePrice;
  // entryOwners is used to differentiate self-owned tix which is in play vs for sale
  mapping(uint256 => address) public entryOwners; // is self after round when tix goes up for sale

  event Entered(address player, uint256 indexed tixId);
  event Bought(address player, uint256 indexed tixId);
  event Closed(uint256 indexed blockNumber);
  event Target(uint16 target);
  event SendPrize(address indexed winner, uint256 amount);

  constructor() {
    // what should we do on deploy?
  }

  function init(address _tixToken, address _dealerToken, address _winToken) public onlyOwner {
    //require(_tixToken == address(0), "Already initialized.");
    tixToken = IERC721Enumerable(_tixToken);
    dealerToken = IERC721Enumerable(_dealerToken);
    winToken = IERC20(_winToken);

    canEnter = true;
    setTixSalePrice(1 ether);
  }
  function jackpot() public view returns (uint256) {
    return winToken.balanceOf(address(this));
  }

  function tixByAddress(address owner) public view returns (uint256[] memory) {
    uint256 bal = tixToken.balanceOf(owner);
    uint256[] memory ids = new uint256[](bal);
    for (uint256 i; i < bal; i++) {
      ids[i] = tixToken.tokenOfOwnerByIndex(owner, i);
    }
    return ids;
  }

  function enter(uint256 tixId) public {
    require(canEnter, "Not accepting entries now");
    // assumes contract is approved to transfer
    tixToken.transferFrom(msg.sender, address(this), tixId);
    entries.push(tixId);
    entryOwners[tixId] = msg.sender;
    emit Entered(msg.sender, tixId);
  }

  function entryCount() public view returns (uint256) {
    return entries.length;
  }

  function tixForSaleCount() public view returns (uint256) {
    uint256 bal = tixToken.balanceOf(address(this));
    uint256 count;
    for (uint i = 0; i < bal; i++) {
      uint256 id = tixToken.tokenOfOwnerByIndex(address(this), i);
      if (entryOwners[id] == address(this)) {
        count++;
      }
    }
    return count;
  }
  
  function tixForSale() public view returns (uint256[] memory) {
    uint256 bal = tixToken.balanceOf(address(this));
    uint256 forSaleCount = tixForSaleCount();
    uint256[] memory saleIds = new uint256[](forSaleCount);
    uint256 iSale;
    for (uint256 iBal = 0; iBal < bal; iBal++) {
      uint256 id = tixToken.tokenOfOwnerByIndex(address(this), iBal);
      if (entryOwners[id] == address(this)) {
        saleIds[iSale] = id;
        iSale++;
      }
    }
    return saleIds;
  }

  function setTixSalePrice(uint256 price) public {
    require(dealerToken.balanceOf(msg.sender) != 0, "Not a dealer");
    tixSalePrice = price;
  }

  function buyTix(uint256 tixId) public {
    require(entryOwners[tixId] == address(this), "Not for sale");
    // adds to jackpot
    winToken.transferFrom(msg.sender, address(this), tixSalePrice);
    tixToken.transferFrom(address(this), msg.sender, tixId);
    // leave entryOwners until player enters it
    emit Bought(msg.sender, tixId);
  }

  function close(bytes32 secretHash) public /*onlyOwner*/ {
    require(canEnter, "To close, play must be open");
    require(dealerToken.balanceOf(msg.sender) != 0, "Not a dealer");
    _secretHash = secretHash;
    canEnter = false;
    futureBlockNumber = block.number + 1; // bump to 16
    emit Closed(futureBlockNumber);
  }
  function _open() internal {
    canEnter = true;
    stashedHash = 0;
    futureBlockNumber = 0;
    // entries have been copied to tixForSale and ownership changed to ourselves
    delete entries;
  }

  function stashHash() public {
    require(stashedHash == 0, "A hash has been stashed");
    require(canEnter == false, "Game is still enterable");
    require(block.number > futureBlockNumber, "Not sufficiently in the future");
    stashedHash = blockhash(futureBlockNumber);
  }

  function reveal(uint256 secret) public /*onlyOwner*/ {
    bytes32 hash = keccak256(abi.encodePacked(secret, msg.sender));
    require(dealerToken.balanceOf(msg.sender) != 0, "Not a dealer");
    require(hash == _secretHash, "Wrong secret");
    if (stashedHash == 0) {
      stashHash();
    }
    _award(secret);
    _open();
  }

  function _rng(uint256 a, uint256 b) private pure returns (uint256) {
    return a ^ b; // TODO
  }

  // also cleans up entries and moves them to forSale
  function _award(uint256 secret) internal {
    uint16 target = uint16(_rng(uint256(stashedHash), uint256(secret)) % 10000);
    emit Target(target);

    for (uint i; i < entries.length; i++) {
      uint16 _entry = uint16(entries[i] % 10000);
      if (_entry > target && _entry - target < 5000) {
        // WINNAR IS U
        _sendPrize(entryOwners[entries[i]], 10 * 10**18);
      } else if (entries[i] % 3 == 0) {
        _sendPrize(entryOwners[entries[i]], 3 * 10**18);
      } else if (entries[i] % 10 < 5) {
        _sendPrize(entryOwners[entries[i]], 1 * 10**18);
      }

      // remove from play and put up for sale, delete entries during _open
      entryOwners[entries[i]] = address(this);
    }
  }

  function _sendPrize(address winner, uint256 amount) internal {
    // check jackpot and adjust if not enough left
    // if jackpot() - amount < _minimum then amount = jackpot() - _minimum
    winToken.transfer(winner, amount);
    emit SendPrize(winner, amount);
  }

}
