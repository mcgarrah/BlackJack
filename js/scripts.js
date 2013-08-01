var suits = ["hearts", "diamonds", "clubs", "spades"];
var values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];   
var pre = "cards/";
var ext = ".png";
var cardsDrawn = 0;
var bet = 10;
var money = 500;
var playerHand = new Array();
var dealerHand = new Array();

//lets create a card Object
function Card(suit, value, precedent, filename) {
  this.suit = suit;
  this.value = value;
  this.imageFile = filename;
  this.precedent = precedent;
}

function draw()
{
  cardsDrawn++;
  return deck.pop();
}

function shuffle(deck)
{
  var counter = deck.length, temp, index;
  while(counter > 0)
  {
    // Pick a random index
    index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    temp = deck[counter];
    deck[counter] = deck[index];
    deck[index] = temp;
  }
  return deck;
}

var deck;

function createDeck()
{
  cardsDrawn = 0;
  deck = new Array();
  playerHand.length = 0;
  dealerHand.length = 0;
  //lets create the deck
  //lets go through the suits
  for(var suit = 0; suit < suits.length; suit++)
  {
    for(var value = 0; value < values.length; value++)
    {
      var imageFile = pre + values[value] + "_of_" + suits[suit] + ext;
      var card = new Card(suits[suit], values[value], value, imageFile);
      deck.push(card);
    }
  }

  //lets shuffle the deck
  shuffle(deck);
  //lets deal the cards
  playerHand.push(draw());
  playerHand.push(draw());
  dealerHand.push(draw());
  dealerHand.push(draw());
}

function getScore(hand)
{
  hand.sort(function(a, b) {return a.precedent - b.precedent});
  var score = 0;
  for(var index = 0; index < hand.length; index++)
  {
    var precedent = hand[index].precedent;
    if(precedent < 8) //found 2-10
    {
      score += precedent + 2;
    }
    else if(precedent == 12) //ace
    {
        if(score == 11)
        {
          score += 1;
        }else if(score < 11)
        {
          score += 11;
        }else{
          score += 1;
        }
    }else //found King, Queen, or Jack
    {
      score += 10;
    }
  }
  return score;
}

function loadImages(sources, callback) {
  var cardImages = new Array();
  var loadedImages = 0;
  var numImages = cardsDrawn;

  var card_back = new Image();
  card_back.src = pre + "card_back" + ext;

  for(var index = 0; index < cardsDrawn; index++) {
    cardImages[index] = new Image();
    cardImages[index].onload = function() {
      if(++loadedImages >= numImages) {
        callback(cardImages, card_back);
      }
    };
    cardImages[index].src = sources[index];
  }
  loadedImages = 0;
}

var canvas = document.getElementById('myCanvas');
canvas.width = window.innerWidth;
canvas.height = 500;
var context = canvas.getContext('2d');


function load(stand)
{
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  var sources = new Array();
  for(var index = 0; index < dealerHand.length; index++)
  {
    sources.push(dealerHand[index].imageFile);
  }
  for(var index = 0; index < playerHand.length; index++)
  {
    sources.push(playerHand[index].imageFile);
  }

  //card back
  loadImages(sources, function(cardImages, card_back) {
    var cardX = 20;
    var cardY = 30;
    for(var index = 0; index < cardsDrawn; index++)
    {
      if(index == dealerHand.length)
      {
        cardX = 20;
        cardY = 300;
      }

      //print out hand total
      if(index == 0 && !stand){
        context.drawImage(card_back, cardX += card_back.width*.25/3, cardY, card_back.width*.25, card_back.height*.25);
      }else{
        context.drawImage(cardImages[index], cardX += cardImages[index].width*.25/3, cardY, cardImages[index].width*.25, cardImages[index].height*.25);
      }

       if(index%2 != 0) //odd index
      {
        context.font = '40pt Arial';
        context.fillStyle = 'white';
        if(index == 3) //print dealer hand total
        {
          context.fillText(getScore(playerHand), window.innerWidth/3, window.innerHeight/8*4);
        }
      }
    }

    if(stand){
      var newGame = confirm(getWinner() + "Another round?");
      if(newGame)
      {
        createDeck();
        load();
      }
    }
  });
}

function getWinner()
{
  var dealerWins = "Dealer wins! ";
  var playerWins = "You win! ";
  var playerBust = "You Busted :(   ";
  var dealerBust = "Dealer Busted :D   ";
  if(getScore(playerHand) > 21)
  {
    if(money >= bet)
    {
      money = money-bet;
      var cash = document.getElementById('Money');
      cash.innerHTML = money;
    }
    document.getElementById('hit').style.display='table-row';
    return playerBust; 
  }else if(getScore(dealerHand) > 21 )
  {
   if(money >= bet)
    {
      money = money+bet;
      var cash = document.getElementById('Money');
      cash.innerHTML = money;
    }
     document.getElementById('hit').style.display='table-row';
    return dealerBust; 
  }else if(getScore(dealerHand) > getScore(playerHand)){
   if(money >= bet)
    {
      money = money-bet;
      var cash = document.getElementById('Money');
      cash.innerHTML = money;
    }
     document.getElementById('hit').style.display='table-row';
    return dealerWins; 
  }else if(getScore(playerHand) > getScore(dealerHand)){ 
    if(money >= bet)
    {
      money = money+bet;
      var cash = document.getElementById('Money');
      cash.innerHTML = money;
    }
     document.getElementById('hit').style.display='table-row';
     return playerWins;
  }else{
     document.getElementById('hit').style.display='table-row';
    return "Push! ";
  }
}

function hit(hand)
{
  document.getElementById('hit').style.display='none';
  if(hand == 'player')
  {
    console.log('player');
    playerHand.push(draw());
    load();
  }else{
    console.log('dealer');
    dealerHand.push(draw());
  }
  if(getScore(playerHand)>21)
  {
    load(true);
  }
   if(bet>money)
  {
    alert("You don't have enough money to fullfill that bet.");
  }
}

function stand()
{
  while(getScore(dealerHand) < 17)
  {
    hit('dealer');
  }
  load(true);
}

function doubledown(hand)
{
  playerHand.push(draw());
  bet=bet*2; 
    if(getScore(playerHand)<21)
  {
    while(getScore(dealerHand) < 17)
    {
      hit('dealer');
    }
    load(true);
  }
  else if(getScore(playerHand)>21)
  {
    load(true);
  }
}
function clickMe(dec)
{
  if(dec == "up")
  {
    bet = bet+10;
  }
  else if(dec == "down")
  {
     bet=bet-10;
  }

  for(bet=bet; bet<10; bet++)
  {
  
  }
  for(bet=bet; bet>500; bet--)
  {
  
  }
  var count = document.getElementById('numClicks');
  count.innerHTML = bet;
  var cash = document.getElementById('Money');
  cash.innerHTML = money;
 }
 function getRule()
{
  alert("The way to win the game is to be the closest to 21. This is done by the cards you get. All numbers are worth what number card it is, and each face card is worth 10 points, and finally ace can be worth 1 or 11. Each person gets 2 cards one face up and one face down. You have the ability to see both, but the other players can also see the one card that is flipped over. Once it is your turn you can hit which will give you another card that will be face up or you can stand which will not give you any cards. In the special case when you have two of the same numbers in the cards you have you can split them which will give you two hands. If you want to double down you are forced to get only one hit and you have to double your bet. Every round you have to bet atleast $10 and the maxium is $500. Refresh page if you run out of money!");
}
createDeck();
load();