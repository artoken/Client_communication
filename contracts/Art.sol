pragma solidity 0.5.16;

import "./ERC-721Full.sol";

contract ART_CONTRACT is ERC721Full {
     
  //id_internal == token_id
  //id_external == share_id
  // external_to_internal ==> share_to_token   
  // address_to_external   ==>  address_to_share
  uint256[] public ids_internal;
  uint256[] public ids_external;
  address private owner;
  uint public MINIMUM_SHARE = 10;
  uint public MAXIMUM_SHARE = 100;
  
  // token_id --> bool
  mapping(uint256 => bool) internal _tokenExists;

  // share_id --> bool
  mapping(uint256 => bool) internal _shareExists;
  
  // token_id --> all_share
  mapping(uint256 => uint256) internal _all_share_in_token; // must be no greater than 100

  uint256 private token_id;
  mapping(uint256 => ART_TOKEN) internal arts;
  
  mapping(uint256 => uint256) public share_to_token; // share_id --> token_id
  
  mapping(address => mapping(uint256 => uint256)) internal share_in_token;  // share in token_id of token  || address --> token_id ---> share (uint)
  mapping(address => mapping(uint256 => bool)) public have_share; //have share in token  || address --> token_id --> bool
  mapping(address => mapping(uint256 => uint256)) internal address_to_share; // share of address in token || address --> token_id ----> share_id
  
  struct ART_TOKEN {
      uint256 token_id;
      string entity;
      string name;
      string author;
      string genuineness; // may be original, replica or N/A
      string license;
      uint256 year;
      string extra_data; // size, material, current state etc
      string image_link;
  }

  constructor() ERC721Full("ART_TOKEN", "ART") public {
      owner = msg.sender;
  }

  function mint(uint256 _share_id, uint256 _token_id, address for_whom, uint256 _share_in_token ) public {
    require(msg.sender == owner || msg.sender == address(this));
    require(!_shareExists[_share_id]);
    require(_all_share_in_token[_token_id] + _share_in_token <= MAXIMUM_SHARE);
    //require(!token_exist(_token_id), 'Token with this token_id already exists in system');
    require(_share_in_token >= MINIMUM_SHARE, "Can't mint with share less than MINIMUM_SHARE");
    require(for_whom != address(0));

    uint _id = ids_external.push(_share_id);
    _mint(msg.sender, _id);
    _tokenExists[_token_id] = true;
    share_to_token[_share_id] = _token_id;
    address_to_share[for_whom][_token_id] = _share_id;

    super.transferFrom(owner, for_whom, _share_id);
    
    share_in_token[for_whom][_token_id] = _share_in_token;
    have_share[for_whom][_token_id] = true;
    _shareExists[_share_id] = true;
    _all_share_in_token[_token_id] += _share_in_token;
  }
  
  function mint_for_endow(uint256 _share_id, uint256 _token_id, address for_whom, uint256 _share_in_token ) internal {
    require(token_exist(_token_id));
    require(have_share[msg.sender][_token_id]);
    require(for_whom != address(0));
    //require(!_tokenExists[_share_id], 'Token with this external id already exists in system');
    
    uint _id = ids_external.push(_share_id);
    _mint(for_whom, _id);
    share_to_token[_id] = _token_id;
    address_to_share[for_whom][_token_id] = _share_id;
    share_in_token[for_whom][_token_id] = _share_in_token;
    have_share[for_whom][_token_id] = true;
    _shareExists[_id] = true;
  }
  
  function token_exist(uint256 _token_id) public view returns (bool){
      return _tokenExists[_token_id];
  }
  
  
  function set_art_token(uint256 _token_id, string memory _entity, string  memory _name, string  memory _author, 
                      string memory _license, uint256 _year, 
                      string memory _genuineness, string memory _extra_data, string memory _image_link) public {
        require(msg.sender == owner || msg.sender == address(this));
        require(token_exist(_token_id), "Token with this token_id already doesn't exist in system");
        ART_TOKEN storage art = arts[_token_id];
        art.token_id = _token_id;
        art.entity = _entity;
        art.name = _name;
        art.author = _author;
        art.license = _license;
        art.year = _year;
        art.genuineness = _genuineness;
        art.extra_data = _extra_data;  
        art.image_link = _image_link;    
    }
    
    //get_art_by_id --> get_art_by_share_id
    function get_art_by_share_id(uint256 _share_id) public returns (uint256, address owner_of_token, 
                                                              string memory entity, string memory name, 
                                                              string memory author, string memory license, uint256 year, 
                                                              string memory genuineness, string memory extra_data) {
      token_id = share_to_token[_share_id];
      require(token_exist(token_id));
      owner_of_token = ownerOf(token_id);
      entity = arts[token_id].entity;
      name = arts[token_id].name;
      author = arts[token_id].author;
      license = arts[token_id].license;
      year = arts[token_id].year;
      genuineness = arts[token_id].genuineness;
      extra_data = arts[token_id].extra_data;

      return(token_id, owner_of_token, entity, name, author, license, year, genuineness, extra_data);
  }

  function get_link_by_token_id(uint256 _token_id) public view returns (string memory image_link) {
      image_link = arts[_token_id].image_link;
      return (image_link);
  }


  
  function endow_share(address _from, address _to, uint256 _share_id, uint256 share_to_transfer) public {
      require(msg.sender == _from);
      require(_to != address(0));
      uint256 id_int = share_to_token[_share_id];
      require(token_exist(id_int)); //id_int = token_id
      require(have_share[_from][id_int]);
      uint256 from_share = share_in_token[_from][id_int];
      require(from_share - MINIMUM_SHARE >= share_to_transfer, "Can't remain share less then MINIMUM_SHARE");
      
      share_in_token[_from][id_int] = from_share - share_to_transfer; // new share of _from
     
      if (have_share[_to][id_int]) {
        share_in_token[_to][id_int] = share_in_token[_to][id_int] + share_to_transfer;
      } else {
        uint256 all_external = ids_external.length; // all_external - all_shares_ids
        mint_for_endow(all_external+1, id_int, _to, share_to_transfer);
      }
  }

  function get_share_in_token(address _from, uint256 _token_id) public view returns (uint256) {
    require(msg.sender == _from || msg.sender == owner);
    return share_in_token[_from][_token_id];
  } 

  function get_share_id_by_address(address _from, uint256 _token_id) public view returns (uint256) {
    require(msg.sender == _from || msg.sender == owner);
    return address_to_share[_from][_token_id];
  } 
  
  function transferFrom(address _from, address _to, uint256 _share_id) public { ///tokenid - external_id
      require(msg.sender == _from || msg.sender == getApproved(_share_id), "Problem here");
      uint256 id_int = share_to_token[_share_id];
      require(token_exist(id_int), "Problem here2");
      require(have_share[_from][id_int], "Problem here3");
      uint256 from_share = share_in_token[_from][id_int];

     // receiver already have a share in token
      if (have_share[_to][id_int]) {
          
        address_to_share[_from][id_int] = 0;
        
        have_share[_from][id_int] = false;
          
        share_in_token[_from][id_int] = 0;
        share_in_token[_to][id_int] = share_in_token[_to][id_int] + from_share;
        super.transferFrom(_from, _to, _share_id);
        
      } else {
         
        address_to_share[_to][id_int] = _share_id;
        address_to_share[_from][id_int] = 0;
        
        have_share[_to][id_int] = true;
        have_share[_from][id_int] = false;
        
        share_in_token[_from][id_int] = 0;
        share_in_token[_to][id_int] = from_share;
        
        /// ПОСМОТРЕТЬ
        super.transferFrom(_from, _to, _share_id);
        
      }
  }

}