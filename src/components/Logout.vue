<template>
  <v-layout justify-end>
    <v-btn color="error" class="caption mx-0" dark small @click="accountDelete()">アカウント削除</v-btn>
    <v-btn color="warning" class="caption" dark small @click="logout()">ログアウト</v-btn>
  </v-layout>
</template>

<script>
var firebase = require("firebase");
var util = require("@/utils/util");

export default {
  name: "Logout",
  methods: {
    // ログアウト
    logout() {
      var vm = this;
      if (!firebase.auth().currentUser) {
        alert("ログインしてください。");
        return;
      }

      this.deleteEditMemo();

      firebase
        .auth()
        .signOut()
        .then(function(res) {
          console.log("signOut", res);
          alert("ログアウトしました。");
          vm.$router.go();
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    accountDelete() {
      console.log("accountDelete");
      var vm = this;
      // アカウント削除
      if (!firebase.auth().currentUser) {
        alert("ログインしてください。");
        return;
      }

      this.deleteEditMemo();

      var uid = firebase.auth().currentUser.uid;
      firebase
        .auth()
        .currentUser.delete()
        .then(function(res) {
          console.log("currentUser.delete", res);
          firebase
            .database()
            .ref("users/" + uid)
            .remove()
            .then(
              function(res) {
                console.log("users remove", res);
                alert("アカウントを削除しました。");
                vm.$router.go();
              },
              function(err) {
                console.log("users remove.err", err);
              }
            );
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    // シェアメモ編集中になっている状態を削除
    deleteEditMemo() {
      var uid = firebase.auth().currentUser.uid;
      var memoid = this.$route.params.memoid;

      if (memoid) {
        firebase
          .database()
          .ref("/memos/" + memoid + "/edit_users/" + uid)
          .remove()
          .then(res => {
            console.log("メモの編集者削除完了", res);
          });
      }
    }
  }
};
</script>

