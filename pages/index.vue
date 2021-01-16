<template>
  <div>
    <nav class="navbar navbar-dark bg-tg">
      <span class="navbar-brand h1">The Game ONLINE（仮称）</span>
    </nav>
    <div class="container-fluid">
      <div class="jumbotron mt-3">
        <h1 class="display-4">ザ・ゲームへようこそ</h1>
        <blockquote class="blockquote">
          <p class="mb-0">
            『ザ・ゲーム』は、手札にランダムに供給される2〜99の番号カードを、全員で相談しながら〈1からの昇順〉と〈100からの降順〉だけが許された4箇所に重ねていき、〈巻き戻し〉も活用しつつ、全カードを出しきれるか否かに挑戦するカードゲームです。
          </p>
          <footer class="blockquote-footer">高円寺０分すごろくや</footer>
        </blockquote>
        <hr class="my-4" />
        <div class="row">
          <div class="col-sm">
            <b-button v-b-modal="'modalCreateRoom'" variant="primary" size="lg">
              部屋を作る
            </b-button>
          </div>
          <div class="col-sm">
            <b-button v-b-modal="'modalJoinRoom'" variant="success" size="lg">
              部屋に参加する
            </b-button>
          </div>
        </div>
      </div>
    </div>
    <b-modal
      id="modalCreateRoom"
      centered
      title="部屋を作る"
      cancel-title="やめる"
      ok-title="作る"
      v-bind:ok-disabled="!createRoomLimitState || !createRoomNameState || !createRoomIdState"
      @ok="createRoomButton"
    >
      <p>新しく部屋を作ります。</p>
      <b-form-input :state="createRoomLimitState" v-model="createRoom.playerLimit" type="number" placeholder="参加人数"></b-form-input>
      <b-form-input :state="createRoomNameState" v-model="createRoom.name" type="text" placeholder="名前"></b-form-input>
      <b-form-input :state="createRoomIdState" v-model="createRoom.roomId" type="text" placeholder="ルームID"></b-form-input>
    </b-modal>
    <b-modal
      id="modalJoinRoom"
      centered
      title="部屋に参加する"
      cancel-title="やめる"
      ok-title="参加"
      ok-variant="success"
      v-bind:ok-disabled="!joinRoomNameState || !joinRoomIdState"
      @ok="joinRoomButton"
    >
      <p>指定したルームIDに参加します。</p>
      <b-form-input :state="joinRoomNameState" v-model="joinRoom.name" type="text" placeholder="名前"></b-form-input>
      <b-form-input :state="joinRoomIdState" v-model="joinRoom.roomId" type="text" placeholder="ルームID"></b-form-input>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data: function() {
    return {
      createRoom: {
        playerLimit: 2,
        name: "",
        roomId: "",
      },
      joinRoom: {
        name: "",
        roomId: "",
      }
    }
  },
  computed: {
    createRoomNameState(): boolean {
      return this.createRoom.name.length >= 2
    },
    createRoomLimitState(): boolean {
      return this.createRoom.playerLimit >= 2
    },
    createRoomIdState(): boolean {
      return this.createRoom.roomId.length >= 5
    },
    joinRoomNameState(): boolean {
      return this.joinRoom.name.length >= 2
    },
    joinRoomIdState(): boolean {
      return this.joinRoom.roomId.length >= 5
    },
  },
  methods: {
    createRoomButton() {
      window.location.href = `/play?playerLimit=${ this.createRoom.playerLimit }&name=${ this.createRoom.name }&roomId=${ this.createRoom.roomId }`
    },
    joinRoomButton() {
      window.location.href = `/play?name=${ this.joinRoom.name }&roomId=${ this.joinRoom.roomId }`
    }
  }
})
</script>

<style>
.join-buttons {
  align-items: flex-end;
}
</style>
