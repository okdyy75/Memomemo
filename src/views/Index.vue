<template>
  <v-app>
    <v-toolbar dark fixed app class="blue-grey">
      <v-toolbar-side-icon @click.stop="leftDrawer = !leftDrawer;loading=false;"></v-toolbar-side-icon>
      <v-toolbar-title class="ml-0">
        <router-link to="/" class="toolbar-title subheading">MemoMemo</router-link>
      </v-toolbar-title>
      <Logout v-if="isLogin"></Logout>
    </v-toolbar>
    <v-navigation-drawer v-model="leftDrawer" fixed>
      <v-list v-if="!isLogin" class="pa-0">
        <v-list-tile>
          <v-list-tile-content>ログインするとメモできます</v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-list v-if="isLogin" class="pa-0">
        <v-list-tile avatar>
          <v-list-tile-avatar>
            <v-img v-if="loginUser.photoURL" :src="loginUser.photoURL"></v-img>
            <v-icon v-else>person</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{loginUser.displayName}} さん</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-list dense v-if="isLogin">
        <v-list-tile avatar>
          <v-list-tile-title>マイメモ</v-list-tile-title>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile
          v-for="(memo, memoid) in memos"
          :key="memoid"
          :to="{path: '/mypage/memos/' + memoid}"
        >{{memo.memo_info.memo ? memo.memo_info.memo.split(/\n/)[0] : ''}}</v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <div>
      <router-view :isLogin="isLogin"></router-view>
      <router-link v-if="loading && isLogin" :to="'/mypage/memos/'" class="addMemoBtn">
        <v-btn v-if="isLogin" fixed bottom left fab dark class="indigo">
          <v-icon>add</v-icon>
        </v-btn>
      </router-link>
    </div>
    <!-- <v-footer color="blue-grey" app>
      <v-layout justify-center>
        <v-btn block flat class="ma-0">
          <v-icon x-large color="white">home</v-icon>
        </v-btn>
        <v-btn block flat class="ma-0">
          <v-icon x-large color="white">favorite</v-icon>
        </v-btn>
        <v-btn block flat class="ma-0">
          <v-icon x-large color="white">person</v-icon>
        </v-btn>
      </v-layout>
    </v-footer>-->
  </v-app>
</template>

<script>
var firebase = require("firebase");
import Login from "@/components/Login.vue";
import Logout from "@/components/Logout.vue";

export default {
  name: "Index",
  components: {
    Login: Login,
    Logout: Logout
  },
  data() {
    return this.init();
  },
  // マイメモ一覧表示
  beforeRouteEnter(route, redirect, next) {
    console.log("Index_beforeRouteEnter");
    firebase.auth().onAuthStateChanged(user => {
      console.log("onAuthStateChanged", user);
      next(vm => {
        vm.before(vm, null);
      });
    });
  },
  // マイメモ一覧表示更新
  beforeRouteUpdate(to, from, next) {
    console.log("Index_beforeRouteUpdate");
    firebase.auth().onAuthStateChanged(user => {
      console.log("onAuthStateChanged", user);
      this.before(this, next);
    });
  },
  // beforeCreate: function() {
  //   console.log("Index_beforeCreate");
  // },
  // created: function() {
  //   console.log("Index_created");
  // },
  // beforeMount() {
  //   console.log("Index_beforeMount");
  // },
  // mounted() {
  //   console.log("Index_mounted");
  // },
  // beforeUpdate() {
  //   console.log("Index_beforeUpdate");
  // },
  updated() {
    console.log("Index_updated", this.loading);

    if (this.loading) {
      return;
    }

    if (!this.isLogin) {
      this.loading = true;
      return;
    }

    console.log("マイメモ一覧取得");
    this.loading = false;
    firebase
      .database()
      .ref("users/" + this.loginUser.uid + "/memos")
      .orderByChild("/memo_info/updated_at_desc")
      .once("value")
      .then(snapshot => {
        console.log("マイメモ一覧取得", snapshot);
        var memos = {};
        snapshot.forEach(childSnapshot => {
          var memo = childSnapshot.val();
          memos[childSnapshot.key] = memo;
        });
        this.loading = true;
        this.memos = memos;
      });
  },
  methods: {
    init() {
      return {
        loading: false,
        leftDrawer: null,
        left: false,
        isLogin: false,
        displayName: "ゲスト",
        loginUser: null,
        memos: {},
        snackbar: true
      };
    },
    before(vm, next) {
      console.log("Index_before");
      var user = firebase.auth().currentUser;

      // リセット
      Object.assign(vm.$data, vm.init());

      if (!user) {
        vm.loading = true;
        if (next) {
          next();
        }
        return;
      }

      vm.memos = {};
      vm.isLogin = true;
      vm.displayName = user.displayName;
      vm.loginUser = user;
      console.log("マイメモ一覧初期取得");
      vm.loading = false;
      firebase
        .database()
        .ref("users/" + vm.loginUser.uid + "/memos")
        .orderByChild("/memo_info/updated_at_desc")
        .once("value")
        .then(snapshot => {
          console.log("マイメモ一覧初期取得完了", snapshot);
          var memos = {};
          snapshot.forEach(childSnapshot => {
            var memo = childSnapshot.val();
            memos[childSnapshot.key] = memo;
          });
          vm.loading = true;
          vm.memos = memos;
          if (next) {
            next();
          }
        });
    },
    // ログアウト
    logout() {
      if (!firebase.auth().currentUser) {
        alert("ログインしてください。");
        return;
      }
      firebase
        .auth()
        .signOut()
        .then(function(res) {
          console.log("signOut", res);
          alert("ログアウトしました。");
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    accountDelete() {
      // アカウント削除
      if (!firebase.auth().currentUser) {
        alert("ログインしてください。");
        return;
      }
      if (!window.confirm("本当に削除しますか？")) {
        return false;
      }
      firebase
        .auth()
        .currentUser.delete()
        .then(function(res) {
          console.log("currentUser.delete", res);
          firebase
            .database()
            .ref("users/" + firebase.auth().currentUser.uid)
            .remove()
            .then(
              function(res) {
                console.log("users remove", res);
                alert("アカウントを削除しました。");
              },
              function(err) {
                console.log("users removeerr", err);
              }
            );
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  },
  watch: {
    $route(to, from) {
      console.log("Index_watch");
    }
  }
};
</script>

<style>
div.v-toolbar__content {
  padding-right: 0px;
}
a.toolbar-title {
  color: white;
  text-decoration: none;
}
</style>
