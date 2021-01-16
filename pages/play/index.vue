<template>
  <div class="player">
    <nav class="navbar navbar-dark bg-tg">
      <span class="navbar-brand h1">The Game ONLINE（仮称）</span>
    </nav>
    <div class="container-fluid main" v-bind:class="{disabled: this.roomObject.gameTurnIndex !== playerIndex}">
      <div class="d-flex flex-column">
        <ul class="list-group list-group-horizontal-md my-3">
          <li class="list-group-item flex-fill"><h1>山札の数:{{ this.roomObject.deck.length }}</h1></li>
          <li class="list-group-item flex-fill"><h1><b-button @click="turnEnd" variant="success">ターンエンド</b-button></h1></li>
        </ul>
        <ul class="list-group list-group-horizontal-md my-3">
          <li v-for="(player, index) in this.roomObject.players" class="list-group-item flex-fill" v-bind:class="{'list-group-item-primary': index === roomObject.gameTurnIndex}"><h4 class="mb-0">{{ player.name }} <b-badge variant="info">{{ player.hands.length }}</b-badge></h4></li>
        </ul>
        <div class="d-flex flex-wrap flex-row my-3 card-place">
          <div>100</div>
          <div v-for="item in roomObject.leads.desc01">{{ item }}</div>
          <div class="align-self-center">
            <b-button @click="clickPlayCard('desc01')" v-bind:disabled="!leadButtons.desc01" block variant="tg">ここに置く</b-button>
          </div>
        </div>
        <div class="d-flex flex-wrap flex-row my-3 card-place">
          <div>100</div>
          <div v-for="item in roomObject.leads.desc02">{{ item }}</div>
          <div class="align-self-center">
            <b-button @click="clickPlayCard('desc02')" v-bind:disabled="!leadButtons.desc02" block variant="tg">ここに置く</b-button>
          </div>
        </div>
        <div class="d-flex flex-wrap flex-row my-3 card-place">
          <div>1</div>
          <div v-for="item in roomObject.leads.asc01">{{ item }}</div>
          <div class="align-self-center">
            <b-button @click="clickPlayCard('asc01')" v-bind:disabled="!leadButtons.asc01" block variant="tg">ここに置く</b-button>
          </div>
        </div>
        <div class="d-flex flex-wrap flex-row my-3 card-place">
          <div>1</div>
          <div v-for="item in roomObject.leads.asc02">{{ item }}</div>
          <div class="align-self-center">
            <b-button @click="clickPlayCard('asc02')" v-bind:disabled="!leadButtons.asc02" block variant="tg">ここに置く</b-button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="this.roomObject.gameTurnIndex >= 0" class="container-fluid">
      <div
        class="d-flex flex-nowrap flex-row justify-content-between card-hand"
      >
        <div v-for="(hand, index) in roomObject.players[this.playerIndex].hands" @click="clickHandCard(index)" v-bind:class="{active: activeHandCard === index}">{{ hand }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as io from "socket.io-client";

export default Vue.extend({
  components: {},
  data: function() {
    return {
      socket: '',
      state: {
        ready: 0,
        progress: 1,
        preEnd: 2,
        end: 3,
      },
      roomObject: {
        roomId: 0,
        playerLimit: 2,
        players: [
          {id: -1, name:"", hands:[0], plays:0}
        ],
        gameState: 0,
        gameTurnIndex: -1,
        minPlays: 2,
        deck: [],
        leads: {
          desc01: [],
          desc02: [],
          asc01: [],
          asc02: [],
        },
      },
      playerIndex: -2,
      leadButtons: {
        desc01: false,
        desc02: false,
        asc01: false,
        asc02: false,
      },
      activeHandCard: -1,
    }
  },
  mounted() {
    if(this.$route.query.roomId == null || this.$route.query.name == null) {
      return
    }

    const roomId = this.$route.query.roomId
    const name = this.$route.query.name

    this.socket = io(process.env.beUrl)
    if(this.$route.query.playerLimit != null) {
      const playerLimit = this.$route.query.playerLimit
      this.socket.emit('join-game', {
        playerLimit: playerLimit,
        name: name,
        roomId: roomId,
      })
    } else {
      this.socket.emit('join-game', {
        name: name,
        roomId: roomId,
      })
    }

    this.socket.on("game-ready", (roomValue) => {
      this.roomObject = Object.assign({}, roomValue.roomObject)
    })

    this.socket.on("game-start", (roomValue) => {
      this.roomObject = Object.assign({}, roomValue.roomObject)
      this.playerIndex = this.roomObject.players.findIndex((v) => v.id === this.socket.id)

      if(this.roomObject.gameTurnIndex === this.playerIndex) {
        this.yourTurn()
      }
    })

    this.socket.on("game-update", (roomValue) => {
      this.roomObject = Object.assign({}, roomValue.roomObject)

      if(this.roomObject.gameState !== this.state.end && this.roomObject.gameTurnIndex === this.playerIndex && this.roomObject.players[this.playerIndex].hands.length === 0) {
        this.$bvToast.toast(`ターンエンドしてください。`, {
          title: 'プレイできるカードがありません！',
          variant: 'warning',
          autoHideDelay: 4000,
        })
      }

      if(this.roomObject.gameTurnIndex === this.playerIndex && roomValue.func === "next-turn") {
        this.yourTurn()
      }
    })

    this.socket.on("game-error", (errorValue) => {
      this.gameForcedEnd(errorValue.msg)
    })

    this.socket.on("game-end", (endValue) => {
      const func = endValue.func

      if(func === "badEnd") {
        this.gameBadEndModal()
      } else if(func === "preEnd") {
        this.gamePreEndModal()
      } else if(func === "preExitEnd") {
        this.gamePreExitEndModal()
      } else if(func === "end") {
        this.gameEndModal()
      }
    })

    window.onbeforeunload = function(e) {
      this.socket.disconnect
      return
    }
  },
  methods: {
    clickPlayCard(leadName) {
      const playCard = this.roomObject.players[this.playerIndex].hands[this.activeHandCard]
      if(leadName === "desc01") {
        this.roomObject.leads.desc01.push(playCard)
      } else if(leadName === "desc02") {
        this.roomObject.leads.desc02.push(playCard)
      } else if(leadName === "asc01") {
        this.roomObject.leads.asc01.push(playCard)
      } else if(leadName === "asc02") {
        this.roomObject.leads.asc02.push(playCard)
      }
      this.roomObject.players[this.playerIndex].hands.splice(this.activeHandCard, 1)

      this.progressGame("play")

      this.activeHandCard = -1
      this.leadButtons.desc01 = false
      this.leadButtons.desc02 = false
      this.leadButtons.asc01 = false
      this.leadButtons.asc02 = false
    },
    clickHandCard(cardNumber) {
      if(this.roomObject.gameTurnIndex === this.playerIndex) {
        if(this.activeHandCard !== cardNumber) {
          this.activeHandCard = cardNumber

          this.leadButtons.desc01 = this.isPlay(this.roomObject.players[this.playerIndex].hands[cardNumber], this.roomObject.leads.desc01.slice(-1)[0], true)
          this.leadButtons.desc02 = this.isPlay(this.roomObject.players[this.playerIndex].hands[cardNumber], this.roomObject.leads.desc02.slice(-1)[0], true)
          this.leadButtons.asc01 = this.isPlay(this.roomObject.players[this.playerIndex].hands[cardNumber], this.roomObject.leads.asc01.slice(-1)[0], false)
          this.leadButtons.asc02 = this.isPlay(this.roomObject.players[this.playerIndex].hands[cardNumber], this.roomObject.leads.asc02.slice(-1)[0], false)
        } else {
          this.activeHandCard = -1
          this.leadButtons.desc01 = false
          this.leadButtons.desc02 = false
          this.leadButtons.asc01 = false
          this.leadButtons.asc02 = false
        }
      }
    },
    yourTurn() {
      this.$bvModal.msgBoxOk(`${this.roomObject.minPlays}枚プレイしてください。`, {
        title: 'あなたのターンです。',
        centered: true
      })
    },
    gameBadEndModal() {
      this.$bvModal.msgBoxOk(`残念でした！`, {
        title: '失敗',
        centered: true
      })
        .then(value => {
        window.location.href = '/'
      })
        .catch(err => {
          // An error occurred
        })
    },
    gamePreEndModal() {
      this.$bvModal.msgBoxOk(`完全クリアを目指してみましょう。`, {
        title: 'ゲームクリア！',
        centered: true
      })
    },
    gamePreExitEndModal() {
      this.$bvModal.msgBoxOk(`次は完全クリアを目指してみましょう。`, {
        title: 'ゲームクリア！',
        centered: true
      })
        .then(value => {
        window.location.href = '/'
      })
        .catch(err => {
          // An error occurred
        })
    },
    gameEndModal() {
      this.$bvModal.msgBoxOk('完全クリアおめでとうございます！', {
        title: '完全ゲームクリア！',
        okVariant: 'success',
        centered: true
      })
        .then(value => {
          window.location.href = '/'
        })
        .catch(err => {
          // An error occurred
        })
    },
    gameForcedEnd(msg) {
      this.$bvModal.msgBoxOk(msg, {
        title: '［エラー］トップに戻ります。',
        okVariant: 'danger',
        centered: true
      })
        .then(value => {
          window.location.href = '/'
        })
        .catch(err => {
          // An error occurred
        })
    },
    turnEnd() {
      const playCount = this.roomObject.minPlays - this.roomObject.players[this.playerIndex].plays
      this.activeHandCard = -1
      this.leadButtons.desc01 = false
      this.leadButtons.desc02 = false
      this.leadButtons.asc01 = false
      this.leadButtons.asc02 = false

      if(playCount <= 0 || this.roomObject.players[this.playerIndex].hands.length === 0) {
        this.$bvToast.toast(`ターンエンド`, {
          title: 'ターンエンドしました。',
          variant: 'success',
          autoHideDelay: 4000,
        })
        this.progressGame("turn-end")
      } else {
        this.$bvToast.toast(`残り${playCount}枚プレイする必要があります。`, {
          title: 'プレイ枚数が足りません！',
          variant: 'danger',
          autoHideDelay: 4000,
        })
      }
    },
    progressGame(func) {
      this.socket.emit("game-progress", {
        roomObject: this.roomObject,
        func: func
      })
    },
    isPlay(playCardNumber, leadCardNumber, order) {
      if(order) {
        if(leadCardNumber == null)
          leadCardNumber = 100
        if((leadCardNumber > playCardNumber) || (playCardNumber === leadCardNumber + 10))
          return true
      } else {
        if(leadCardNumber == null)
          leadCardNumber = 1
        if((leadCardNumber < playCardNumber) || (playCardNumber === leadCardNumber - 10))
          return true
      }
      return false
    },
    canPlay(playerIndex) {
      const roomObject = this.roomObject
      let temp = 0
      roomObject.players[playerIndex].hands.forEach(function(x) {
        if(!isPlay(x, roomObject.leads.desc01.slice(-1)[0], true) && !isPlay(x, roomObject.leads.desc02.slice(-1)[0], true) && !isPlay(x, roomObject.leads.asc01.slice(-1)[0], false) && !isPlay(x, roomObject.leads.asc02.slice(-1)[0], false))
          temp++

        function isPlay(playCardNumber, leadCardNumber, order) {
          if(order) {
            if(leadCardNumber == null)
              leadCardNumber = 100
            if((leadCardNumber > playCardNumber) || (playCardNumber === leadCardNumber + 10))
              return true
          } else {
            if(leadCardNumber == null)
              leadCardNumber = 1
            if((leadCardNumber < playCardNumber) || (playCardNumber === leadCardNumber - 10))
              return true
          }
          return false
        }
      })

      return temp !== 0;
    },
  },
  async asyncData({ app }) {
    if (window.performance) {
      if (performance.navigation.type === 1) {
        app.context.redirect(301, "/")
      }
    }
  },
})
</script>

<style lang="scss" scoped>
//@include media-breakpoint-up(md) {
//  .test {
//    background-color: white;
//  }
//<div class="d-flex flex-md-column flex-row card-places test">
//<div class="d-flex flex-wrap flex-md-row flex-column my-3 card-place">
//}

.player {
  display: flex;
  flex-flow: column;
  min-height: 100vh;
}

.main {
  flex: 1;
}

.disabled {
  pointer-events: none;
  -webkit-filter:grayscale(100%);
  filter:grayscale(100%);
}

.card-place {
  > div {
    padding-top: 0.4rem;
    padding-bottom: 0.4rem;

    margin-bottom: 0.4rem;

    border: solid $tg-color;

    font-size: 3rem;
    text-align: center;
  }
  > div:first-child {
    min-width: 5.3rem;
    color: white;
    background-color: $tg-color;
  }
  > div:not(:first-child) {
    min-width: 4.2rem;
  }
  > div:not(:last-child) {
    margin-right: 3px;
  }
  > div:last-child {
    border: none;
  }
}

.card-hand {
  max-width: 50%;
  margin: 0 auto;

  > div {
    cursor: pointer;

    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    padding-top: 0.4rem;
    padding-bottom: 0.4rem;

    margin-bottom: 0.4rem;

    min-width: 4.2rem;

    background-color: white;
    border: solid $tg-color;

    font-size: 3rem;
    text-align: center;
  }
  > div:not(:last-child) {
    margin-right: 3px;
  }
  > .active {
    transform: scale(1.5, 1.5) translateY(-15px);
  }
}
</style>
