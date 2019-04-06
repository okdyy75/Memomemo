<template>
  <div>
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<script>
var firebase = require("firebase");
var firebaseui = require("firebaseui-ja");
require("firebaseui-ja/dist/firebaseui.css");

var util = require("@/utils/util");

export default {
  name: "Login",
  mounted() {
    console.log("Login_mounted");
    var vm = this;
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start("#firebaseui-auth-container", {
      callbacks: {
        uiShown: function() {
          console.log("uiShown");
        },
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          console.log("signInSuccessWithAuthResult", authResult, redirectUrl);

          var isNewUser = authResult.additionalUserInfo.isNewUser;
          var displayName = authResult.user.displayName;
          var photoURL = authResult.user.photoURL;
          var loginProviderId = null;

          // SNSログイン＆登録済みであればスキップ
          if (!isNewUser && displayName != "ゲスト") {
            return true;
          }

          switch (authResult.additionalUserInfo.providerId) {
            case firebase.auth.GoogleAuthProvider.PROVIDER_ID: // OK
              displayName = authResult.additionalUserInfo.profile.name;
              photoURL = authResult.additionalUserInfo.profile.picture;
              break;
            case firebase.auth.FacebookAuthProvider.PROVIDER_ID: // OK
              displayName = authResult.additionalUserInfo.profile.name;
              photoURL = authResult.additionalUserInfo.profile.picture.data.url;
              break;
            case firebase.auth.TwitterAuthProvider.PROVIDER_ID: // OK
              displayName = authResult.additionalUserInfo.profile.name;
              photoURL =
                authResult.additionalUserInfo.profile.profile_image_url;
              break;
            case firebase.auth.GithubAuthProvider.PROVIDER_ID: //OK
              displayName = authResult.additionalUserInfo.profile.name;
              photoURL = authResult.additionalUserInfo.profile.avatar_url;
              break;
            default:
              displayName = "ゲスト";
              photoURL = "";
              break;
          }

          displayName = displayName || authResult.user.displayName;
          photoURL = photoURL || authResult.user.photoURL;
          loginProviderId = authResult.additionalUserInfo.providerId || null;

          var uid = authResult.user.uid;
          var user = {
            displayName: displayName,
            photoURL: photoURL,
            loginProviderId: loginProviderId
          };

          if (isNewUser) {
            user.created_uid = uid;
            user.created_at = vm.getDateTime();
          }
          user.updated_uid = uid;
          user.updated_at = vm.getDateTime();

          firebase
            .auth()
            .currentUser.updateProfile(user)
            .then(res => {
              console.log("Auth登録完了", res);
              firebase
                .database()
                .ref("users/" + uid + "/user_info")
                .update(user)
                .then(res => {
                  console.log("ユーザー登録完了", res);
                  alert("ログインしました。");
                  vm.$router.go();
                });
            });
        },
        signInFailure: function(error) {
          console.log("signInFailure", error);
          alert(error.message);
          return true;
        }
      },
      autoUpgradeAnonymousUsers: true,
      signInFlow: "redirect",
      signInSuccessUrl: "/",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ]
    });
  },
  methods: {
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
    }
  }
};
</script>

