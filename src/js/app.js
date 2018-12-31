App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: async function() {

        return await App.initWeb3();
    },

    initWeb3: async function() {

        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {

         $.getJSON('ComingBack.json',function(data){
            var ComingBackArtifact = data;
            App.contracts.ComingBack = TruffleContract(ComingBackArtifact);
            App.contracts.ComingBack.setProvider(App.web3Provider);

            return App.seekingInfoShow();
        });
         return App.bindEvents();
    },


    bindEvents: function() {
        $(document).on('click', '.btn-donation', App.handleDonation);
        $(document).on('click', '.btn-check', App.handleCheck);
        $(document).on('click', '.btn-ok', App.handleOK);
        $(document).on('click', '.btn-cancel', App.handleCancel);
        $(document).on('click', '.btn-create', App.createLooker);
    },

    handleCancel: function(){
        var _id = parseInt($(event.target).data('id'));
        $('.panel-looker').eq(_id).find(".btn-donation").attr('disabled', false);
        $('.panel-looker').eq(_id).find(".btn-check").attr('disabled', false);
        $('.panel-looker').eq(_id).find(".btn-ok").attr('disabled', false);
        $('.panel-looker').eq(_id).find("#input").val("");
        $('.panel-looker').eq(_id).find(".hidePart").hide();

    },
    seekingInfoShow: function(){
        var lookersRow = $('#lookersRow');
        var lookerTemplate = $('#lookerTemplate');

        web3.eth.getCoinbase(function(err,account){
            if(err === null){
                App.account = account;
                var comingbackInstance;
                App.contracts.ComingBack.deployed().then(function(instance) {
                    comingbackInstance = instance;
                    return comingbackInstance.LoverMap(App.account,{from:App.account});
                }).then(function(lover){
                    $("#accountLover").html("您的爱心值: " + lover);
                }).catch(function(err){
                  console.log(err.message);
                });   
            }

            var comingbackInstance;

            App.contracts.ComingBack.deployed().then(function(instance) {
                comingbackInstance = instance;
                return comingbackInstance.LookerNum({from:App.account});
            }).then(function(lookernum){
                console.log(lookernum.toString());

                for (var i=0;i<lookernum;i++){
                    var promise=Promise.resolve(i);
                    promise.then(function(i){
                        comingbackInstance.LookerInfoQuery(i).then(function(info){
                            lookerTemplate.find('.panel-title').text(info[2]);
                            lookerTemplate.find('img').attr('src', info[3]);   
                            lookerTemplate.find('.looker-breed').text(info[4]);
                            lookerTemplate.find('.looker-bonus').text(info[5]+" wei");
                            lookerTemplate.find('.looker-location').text(info[1]);
                            lookerTemplate.find('.btn-doc').attr('data-id', i);
                            console.log(i.toString());
                            lookersRow.append(lookerTemplate.html());
                        });
                    });
                    

                }

            }).catch(function(err){
              console.log(err.message);
            });    

        });
        
    },

    createLooker: function(event) {
        event.preventDefault();

        if($('.create-table').is(":hidden")){
            $('.create-table').show();
        }
        else{
            var PhoneNumber=$('#PhoneNumber').val();
            var Missname=$('#Missname').val();
            var MissPicture=$('#MissPicture').val();
            var MoreDetails=$('#MoreDetails').val();
            var Bonus=$('#Bonus').val();
            web3.eth.getCoinbase(function(err,account){
                if(err === null){
                    App.account = account;
                    var comingbackInstance;
                    App.contracts.ComingBack.deployed().then(function(instance) {
                        comingbackInstance = instance;
                        return comingbackInstance.LoverMap(App.account,{from:App.account});
                    }).then(function(lover){
                        $("#accountLover").html("您的爱心值: " + lover);
                    }).catch(function(err){
                      console.log(err.message);
                    });   
                }

                var comingbackInstance;

                App.contracts.ComingBack.deployed().then(function(instance) {
                    comingbackInstance = instance;

                    return comingbackInstance.createLooker(App.account, PhoneNumber, Missname,MissPicture,MoreDetails,{from:App.account,value:web3.toWei(Bonus,"ether")});
                }).then(function(result) {
                    return comingbackInstance.LookerNum({from:App.account});
                }).then(function(lookernum){
                    var lookersRow = $('#lookersRow');
                    var lookerTemplate = $('#lookerTemplate');
                    var _id = lookernum-1;;
                    var promise=Promise.resolve(_id);
                    promise.then(function(_id){
                        comingbackInstance.LookerInfoQuery(_id).then(function(info){
                            lookerTemplate.find('.panel-title').text(info[2]);
                            lookerTemplate.find('img').attr('src', info[3]);   
                            lookerTemplate.find('.looker-breed').text(info[4]);
                            lookerTemplate.find('.looker-bonus').text(info[5]+" wei");
                            lookerTemplate.find('.looker-location').text(info[1]);
                            lookerTemplate.find('.btn-doc').attr('data-id', _id);
                            console.log(_id.toString());
                            lookersRow.append(lookerTemplate.html());
                        });
                    });
                 }).catch(function(err) {
                    console.log(err.message);
                });
            });
            $('.create-table').hide();
        }
        

    },
    handleOK: function(event) {
        event.preventDefault();

        var _id = parseInt($(event.target).data('id'));
        if($('.panel-looker').eq(_id).find(".hidePart").is(":hidden")){
            $('.panel-looker').eq(_id).find(".hidePart").show();
            $('.panel-looker').eq(_id).find("#input").attr("placeholder","True or False(0 or 1)");
            $('.panel-looker').eq(_id).find(".btn-donation").attr('disabled', true);
        }
        else{
            var istrue=$('.panel-looker').eq(_id).find("#input").val();
            console.log(istrue);
            $('.panel-looker').eq(_id).find("#input").val("");
            web3.eth.getCoinbase(function(err,account){
                if(err === null){
                    App.account = account;
                    var comingbackInstance;
                    App.contracts.ComingBack.deployed().then(function(instance) {
                        comingbackInstance = instance;
                        return comingbackInstance.LoverMap(App.account,{from:App.account});
                    }).then(function(lover){
                        $("#accountLover").html("您的爱心值: " + lover);
                    }).catch(function(err){
                      console.log(err.message);
                    });   
                }
            

                var comingbackInstance;

                App.contracts.ComingBack.deployed().then(function(instance) {
                    comingbackInstance = instance;
                    console.log(istrue);
                    return comingbackInstance.LookerInfoQuery(_id);
                }).then(function(looker){

                    return comingbackInstance.Transfer2Finder(_id, istrue,{from:App.account});
                }).then(function(result) {
                    
                    if(istrue === "1"){
                        console.log("istrue === 1");
                        $('.panel-looker').eq(_id).find(".btn-ok").hide();
                        $('.panel-looker').eq(_id).find(".btn-donation").hide();
                     }
                     else{
                        $('.panel-looker').eq(_id).find(".btn-ok").hide();
                        $('.panel-looker').eq(_id).find(".btn-check").show();
                        $('.panel-looker').eq(_id).find(".btn-donation").attr('disabled', false);
                     }

                 }).catch(function(err) {
                    console.log(err.message);
                });
                if($('.panel-looker').eq(_id).find(".btn-donation").is(":hidden")!==true){
                    $('.panel-looker').eq(_id).find(".btn-donation").attr('disabled', false);
                }
                $('.panel-looker').eq(_id).find(".hidePart").hide();
            });
        }
        

    },

    handleCheck: function(event) {
        event.preventDefault();

        var _id = parseInt($(event.target).data('id'));

        if($('.panel-looker').eq(_id).find(".hidePart").is(":hidden")){
            $('.panel-looker').eq(_id).find(".hidePart").show();
            $('.panel-looker').eq(_id).find("#input").attr("placeholder","Miss Name");
            $('.panel-looker').eq(_id).find(".btn-donation").attr('disabled', true);
        }
        else{
            var missname=$('.panel-looker').eq(_id).find("#input").val();
            console.log(missname);
            $('.panel-looker').eq(_id).find("#input").val("");

            web3.eth.getCoinbase(function(err,account){
                if(err === null){
                    App.account = account;
                    var comingbackInstance;
                    App.contracts.ComingBack.deployed().then(function(instance) {
                        comingbackInstance = instance;
                        return comingbackInstance.LoverMap(App.account,{from:App.account});
                    }).then(function(lover){
                        $("#accountLover").html("您的爱心值: " + lover);
                    }).catch(function(err){
                      console.log(err.message);
                    });   
                }

                var comingbackInstance;
                App.contracts.ComingBack.deployed().then(function(instance) {
                    comingbackInstance = instance;
                    return comingbackInstance.checkMissingInfo(_id, missname,{from:App.account});
                }).then(function(result) {

                    return comingbackInstance.isFindCheck(_id);
                }).then(function(isFind) {
                    if(isFind===true){
                       $('.panel-looker').eq(_id).find(".btn-ok").show();
                       $('.panel-looker').eq(_id).find(".btn-check").hide();
                    }
                }).catch(function(err) {
                    console.log(err.message);
                });
                $('.panel-looker').eq(_id).find(".hidePart").hide();
                $('.panel-looker').eq(_id).find(".btn-donation").attr('disabled', false);
            });

        }
        
    },

    handleDonation: function(event) {
        event.preventDefault();
        
        var _id = parseInt($(event.target).data('id'));
        if($('.panel-looker').eq(_id).find(".hidePart").is(":hidden")){
            $('.panel-looker').eq(_id).find(".hidePart").show();
            $('.panel-looker').eq(_id).find("#input").attr("placeholder","Donate Value");
            $('.panel-looker').eq(_id).find(".btn-ok").attr('disabled', true);
            $('.panel-looker').eq(_id).find(".btn-check").attr('disabled', true);
        }
        else{
            var money=$('.panel-looker').eq(_id).find("#input").val();
            $('.panel-looker').eq(_id).find("#input").val("");

            web3.eth.getCoinbase(function(err,account){
                if(err === null){
                    App.account = account;
                    var comingbackInstance;
                    App.contracts.ComingBack.deployed().then(function(instance) {
                        comingbackInstance = instance;
                        return comingbackInstance.LoverMap(App.account,{from:App.account});
                    }).then(function(lover){
                        $("#accountLover").html("您的爱心值: " + lover);
                    }).catch(function(err){
                      console.log(err.message);
                    });   
                }

                var comingbackInstance;
                App.contracts.ComingBack.deployed().then(function(instance) {
                    comingbackInstance = instance;
                    return comingbackInstance.donation(App.account,_id, {from:App.account,value:web3.toWei(money,"ether")});
                }).then(function(t) {
                    comingbackInstance.getTotalAccount(_id).then(function(total){
                        $('.panel-looker').eq(_id).find('.looker-bonus').text(total+" wei");
                    });

                }).catch(function(err) {
                    console.log(err.message);
                });

            });
            $('.panel-looker').eq(_id).find(".hidePart").hide();
            $('.panel-looker').eq(_id).find(".btn-ok").attr('disabled', false);
            $('.panel-looker').eq(_id).find(".btn-check").attr('disabled', false);
        }
        
    }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});