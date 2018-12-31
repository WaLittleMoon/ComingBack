pragma solidity ^0.4.24;

contract ComingBack {
    //捐款爱心人士
    struct Goodman{
        address addr;
        uint Tomoney;   //捐款数
    }

    //找到失散者的人
    struct Finder{
        bool isFind;    //是否被找到
        address addr;
    }

    //失散者
    struct Missing{
        string name;   //走失者身份认证
        string img;
        string info;   //0或1，0表示男性，1表示女性
        
    }

    //寻人者
    struct Looker{
        address addr;
        string connection;
        Missing miss;   //走失者信息
        uint bonus;     //寻人者提供的奖励金
        uint receivedMoney;   //爱心人士捐款总额
        Finder finder;    //找到走失者的人
        uint GooderNum;   //捐款次数
        mapping (uint =>Goodman) GooderMap;   //捐款记录
    }

    //寻人者的数量及mapping映射
    uint public LookerNum = 0;
    mapping (uint=>Looker) public LookerMap;
    mapping (uint=>bool) public isOk;

    //爱心人士对应的爱心值记录总数
    mapping (address=>uint) public LoverMap;
    
    function ComingBack () public {
        createLooker(0xeee4C5b22cCEecD9f21aF150516BBC9229194FC5,"123456789",'Lena',"images/lena.jpg","女，20岁，身高1米65左右");
        createLooker(0xeee4C5b22cCEecD9f21aF150516BBC9229194FC5,"123456789",'Cat',"images/cat.jpg","3岁");
        createLooker(0xeee4C5b22cCEecD9f21aF150516BBC9229194FC5,"123456789",'laoren',"images/laoren.jpg","男，75岁，身高1米70左右");
    }


    //寻人者公布寻人启事
    function createLooker(
        address lookAddr,
        string conn,
        string missname,
        string img,
        string info
        ) public payable{

        require(msg.value>=0,"bonus<0");

        uint _bonus=msg.value;
        Missing memory _miss= Missing(missname,img,info);
        Finder memory _finder=Finder(false,0);

        LookerMap[LookerNum++]=Looker(lookAddr,conn,_miss,_bonus,0,_finder,0);
    }
    
    //爱心人士捐款
    function donation(address goodAddr,uint lookerId) public  payable returns (uint){
        require(lookerId < LookerNum && lookerId>=0,"No this lookerId");
        Looker storage _looker=LookerMap[lookerId];

        require(msg.value >0,"msg.value <= 0");
        _looker.receivedMoney+=msg.value;
        LoverMap[goodAddr]+=msg.value;    //爱心人士的爱心值增加

        _looker.GooderMap[_looker.GooderNum++]=Goodman(goodAddr, msg.value);
        return lookerId;
    }


    //核实走失者信息
    function checkMissingInfo(
        uint lookerId,
        string missname
        ) public returns (bool){
        Looker storage _looker=LookerMap[lookerId];
        Missing storage _miss=_looker.miss;
        require(msg.sender!=_looker.addr, "looker.addr is Finder");
        require(isFindCheck(lookerId)==false, "Someone is checking");

        if (keccak256(_miss.name) == keccak256(missname)){
            Finder storage _finder=_looker.finder;
            _finder.isFind=true;
            _finder.addr=msg.sender;

            return true;
        }
        return false;
    }

    //寻人者确认之后，将对应奖励金发放给finder
    function Transfer2Finder(uint lookerId,uint ischeck) public returns(bool){
        Looker storage _looker=LookerMap[lookerId];
        require(msg.sender==_looker.addr,"not looker ID");
        require(_looker.finder.isFind==true,"No one is found");
        require(isOk[lookerId]==false," Is found already");
        if(ischeck==1){
            _looker.finder.addr.transfer(getTotalAccount(lookerId));

             //寻人者爱心值增加与其得到的奖励金一致，金钱名誉双丰收
            isOk[lookerId]=true;
            LoverMap[_looker.finder.addr]+=getTotalAccount(lookerId);
            return true;
        }
         _looker.finder.isFind=false;
        return false;
    }
    
    function LookerInfoQuery (uint _id) public view returns (address,string,string,string,string,uint){
        return (LookerMap[_id].addr,
                LookerMap[_id].connection,
                LookerMap[_id].miss.name,
                LookerMap[_id].miss.img,
                LookerMap[_id].miss.info,
                getTotalAccount(_id));  
    }
    //寻人启事对应ID的奖励总额
    function getTotalAccount(uint lookerId)public view returns (uint){
        Looker storage _looker = LookerMap[lookerId];
        return _looker.receivedMoney+_looker.bonus;
    }

    //合约的balance
    function getBankBalance() public view returns (uint){
        return address(this).balance;
    }
    function isFindCheck (uint _id) public view returns (bool){
        return LookerMap[_id].finder.isFind;    
    }

}
