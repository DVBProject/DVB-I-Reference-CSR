<template>
  <div>
    <transition name="passwdModal">
      <div v-if="confirmPassword">
        <div class="modal-mask">
          <div class="modal-wrapper" role="dialog" aria-labelledby="exampleModalCenterTitle">
            <div class="modal modal-dialog modal-dialog-centered" tabindex="-1" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalCenterTitle">Change password</h5>
                </div>
                <div class="modal-body">
                  <label for="Provider">Old Password</label>
                  <input type="password" class="form-control my-2" id="Password" v-model="Password" />
                  <p class="small text-warning">{{ oldpasswordMessage }}</p>

                  <div class="form-group my-5">
                    <label for="Provider">New Password</label>
                    <input type="password" class="form-control my-2" id="NewPassword" v-model="NewPassword" />
                    <label for="Provider">Re-type new password</label>
                    <input type="password" class="form-control my-2" id="PasswordCheck" v-model="PasswordCheck" />
                    <p class="small text-warning">{{ passwordMessage }}</p>
                  </div>
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    data-dismiss="modal"
                    @click="confirmPassword = !confirmPassword"
                    >Cancel</button
                  >
                  <button type="button" class="btn btn-danger" @click="changePassword" :disabled="sending"
                    >Change</button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="currentUser" class="list row">
      <div class="col-md-8">
        <h4 class="bi-person-square"
          ><span class="mx-2">{{ currentUser.Name }}</span></h4
        >
        <form>
          <div class="form-group">
            <label for="URI">Name</label>
            <input type="text" class="form-control my-2" id="Name" disabled v-model="currentUser.Name" />
          </div>

          <div class="form-group">
            <label for="URI">E-mail</label>
            <input type="text" class="form-control my-2" id="Email" v-model="currentUser.Email" />
            <p class="small text-warning">{{ emailMessage }}</p>
          </div>

          <div class="my-2">
            <label for="genreDataList" class="form-label">Providers:</label>

            <div class="btn-group">
              <ul class="px-0 btn-group-sm">
                <li
                  v-for="(item, index) in SelectedProviders"
                  v-bind:id="index"
                  v-bind:key="index"
                  class="btn btn-outline-secondary mx-1 my-1"
                  >{{ item.name }}
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
      <div class="col-md-4">
        <div class="btn-group btn-group-sm my-2" role="group">
          <button type="submit" class="btn btn-outline-primary" @click="updateUser" :disabled="sending">
            Update
          </button>
        </div>
        <p class="small">{{ message }}</p>
      </div>

      <div class="form-group">
        <button class="btn btn-outline-primary" @click="confirmPassword = !confirmPassword">
          Change Password
        </button>
      </div>
    </div>
    <div v-else>
      <br />
      <p>User was not found...</p>
    </div>
  </div>
</template>

<script>
  import ProviderDataService from "../../services/ProviderDataService";
  import UserDataService from "../../services/UserDataService";

  export default {
    name: "profile-view",
    data() {
      return {
        confirmPassword: false,
        currentUser: null,
        message: "",
        emailMessage: "",
        passwordMessage: "",
        oldpasswordMessage: "",

        Password: "",
        NewPassword: "",
        PasswordCheck: "",

        providers_ui: [],
        SelectedProviders: [],

        Names: [],

        sending: false,
      };
    },
    methods: {
      getUser() {
        UserDataService.getAll()
          .then((response) => {
            this.currentUser = response.data[0];

            this.Names = this.currentUser.Names;
            console.log(response.data);

            try {
              this.currentUser.Providers = JSON.parse(this.currentUser.Providers);
            } catch {
              console.log("Could not parse", this.currentUser.Providers);
            }
            this.getProviders();
          })
          .catch((e) => {
            console.log(e);
            // some error when fetching data, return to the list list

            setTimeout(() => {
              this.$router.push({ name: "servicelists" });
            }, 2000);
          });
      },
      getProviders() {
        ProviderDataService.getAll()
          .then((response) => {
            this.providers_ui = response.data;
            if (this.currentUser) {
              for (var prov in this.currentUser.Providers) {
                this.addProvider(this.currentUser.Providers[prov]);
              }
            }
          })
          .catch((e) => {
            console.log(e);
            setTimeout(() => {
              this.$router.push({ name: "admin" });
            }, 2000);
          });
      },

      updateUser() {
        if (!this.validateFields()) return;
        let prov = [];

        this.SelectedProviders.forEach((sp) => prov.push(+sp.value));
        const data = {
          ...this.currentUser,
          Providers: JSON.stringify(prov),
          //Role: this.admin ? "admin" : "user"
        };
        console.log(data);
        this.sending = true;
        UserDataService.update(this.currentUser.Id, data)
          .then((response) => {
            this.sending = false;
            console.log(response.data);
            this.message = "The user was updated successfully!";
            /*
              setTimeout(() => {
                this.$router.push({ name: "/" })
              }, 1000)*/
          })
          .catch((e) => {
            this.sending = false;
            console.log(e);
            this.message = "Error updating user";
          });
      },

      changePassword() {
        if (!this.validatePass()) return;

        const data = {
          Password: this.Password,
          NewPassword: this.NewPassword,
        };
        this.sending = true;
        UserDataService.changePwd(data)
          .then((response) => {
            console.log(response.data);
            this.message = "The password was updated successfully!";
            // close modal dalog
            this.confirmPassword = false;
            this.Password = "";
            this.NewPassword = "";
            this.PasswordCheck = "";
          })
          .catch((e) => {
            this.sending = false;
            // close modal dalog
            this.confirmPassword = false;
            console.log(e);
            this.message = "Error updating password";
          });
      },

      validatePass() {
        this.passwordMessage = "";
        this.oldpasswordMessage = "";
        let valid = true;

        if (this.Password == "") {
          valid = false;
          this.oldpasswordMessage = "Please enter you old password";
        }

        if (this.NewPassword !== "") {
          if (this.NewPassword.length < 12) {
            this.passwordMessage = "Pass length must be 12 or more. ";
            valid = false;
          }
          if (this.NewPassword !== this.PasswordCheck) {
            this.passwordMessage += "Passwords do not match, please check!";
            valid = false;
          }
        } else {
          this.passwordMessage = "Password cannot be empty";
          valid = false;
        }

        return valid;
      },

      validateFields() {
        this.nameMessage = "";
        this.emailMessage = "";
        this.message = "";
        let valid = true;

        /*
      if(this.Name == "") {
          this.nameMessage = "Name cannot be empty"
          valid = false
      } */

        if (this.currentUser.Email !== "") {
          if (!this.currentUser.Email.includes("@")) {
            this.emailMessage = "Please check that the e-mail is correct";
            valid = false;
          } else if (!this.currentUser.Email.split("@")[1].includes(".")) {
            this.emailMessage = "Please check that the e-mail is correct";
            valid = false;
          }
        }

        if (!valid) {
          this.message = "Please check all missing fields";
        }

        return valid;
      },

      addProvider(item) {
        const value = item.target ? item.target.value : item;
        const valid = this.providers_ui.find((el) => {
          return el.Id === +value;
        });
        if (valid) {
          this.SelectedProviders.push({ name: valid.Names[0].name, value: value });
        }

        if (item.target) item.target.value = null;
      },
      removeProvider(item) {
        this.SelectedProviders.splice(item.target.id, 1);
      },
    },
    mounted() {
      this.message = "";
      this.getUser();
    },
  };
</script>

<style scoped>
  .edit-form {
    max-width: 300px;
    margin: auto;
  }
  .list {
    text-align: left;
    max-width: 750px;
    margin: auto;
  }
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }
</style>
