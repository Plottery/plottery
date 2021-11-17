pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
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

    constructor() ERC721("Tix", "TIX") public {
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

contract Plottery is Ownable {

  // event SetPurpose(address sender, string purpose);

  string public purpose = "Building Unstoppable Apps!!!";
  IERC721 public tixToken;
  IERC20 public winToken;
  bytes32 private _secretHash;
  bool public canEnter;
  uint256 public futureBlockNumber;
  bytes32 public stashedHash;
  uint256[] public entries; // storage?
  mapping(uint256 => address) public entryOwners;

  event Entered(uint256 indexed tixId);
  event Closed(uint256 indexed blockNumber);
  event Target(uint16 target);
  event SendPrize(address indexed winner, uint256 amount);

  constructor() {
    // what should we do on deploy?
  }

  function init(address _tixToken, address _winToken) public onlyOwner {
    //require(_tixToken == address(0), "Already initialized.");
    tixToken = IERC721(_tixToken);
    winToken = IERC20(_winToken);

    canEnter = true;
  }
  function jackpot() public view returns (uint256) {
    return winToken.balanceOf(address(this));
  }

  function enter(uint256 tixId) public {
    require(canEnter, "Not accepting entries now");
    // assumes contract is approved to transfer
    tixToken.transferFrom(msg.sender, address(this), tixId);
    entries.push(tixId);
    entryOwners[tixId] = msg.sender;
    emit Entered(tixId);
  }

  function close(bytes32 secretHash) public onlyOwner {
    require(canEnter, "To close, play must be open");
    _secretHash = secretHash;
    canEnter = false;
    futureBlockNumber = block.number + 16;
    emit Closed(futureBlockNumber);
  }
  function _open() internal {
    canEnter = true;
    stashedHash = 0;
    futureBlockNumber = 0;
    delete entries;
    // XXX no need to clear entryOwners if entries is safe and adding to it updates entryOwners
  }

  function stashHash() public {
    require(stashedHash == 0, "A hash has been stashed");
    require(canEnter == false, "Game is still enterable");
    if (block.number > futureBlockNumber) {
      stashedHash = blockhash(futureBlockNumber);
    }
  }

  function reveal(uint256 secret) public onlyOwner {
    bytes32 hash = keccak256(abi.encodePacked(secret, msg.sender));
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
    }
  }

  function _sendPrize(address winner, uint256 amount) internal {
    // check jackpot and adjust if not enough left
    // if jackpot() - amount < _minimum then amount = jackpot() - _minimum
    winToken.transferFrom(address(this), winner, amount);
    emit SendPrize(winner, amount);
  }




  function setPurpose(string memory newPurpose) public {
      purpose = newPurpose;
      console.log(msg.sender,"set purpose to",purpose);
      // emit SetPurpose(msg.sender, purpose);
  }
}
