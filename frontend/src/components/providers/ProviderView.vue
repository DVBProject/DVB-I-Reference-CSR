<template>
  <div>
    <transition name="modal">
      <div v-if="confirmDelete">
        <div class="modal-mask">
          <div class="modal-wrapper" role="dialog" aria-labelledby="exampleModalCenterTitle">
            <div class="modal modal-dialog modal-dialog-centered" tabindex="-1" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalCenterTitle">Delete Provider</h5>
                </div>
                <div class="modal-body">
                  <p>ALL related Service Lists will also be deleted!</p>
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-outline-primary"
                    data-dismiss="modal"
                    @click="confirmDelete = !confirmDelete"
                    >Cancel</button
                  >
                  <button type="button" class="btn btn-danger" @click="deleteProvider">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="currentProvider" class="edit-form row">
      <div class="col-sm-8">
        <h4>{{ currentProvider.Names[0].name }}</h4>
      </div>

      <div class="col-sm-4">
        <div class="btn-group btn-group-sm my-2 invisible" role="group">
          <button class="btn btn-outline-danger" @click="confirmDelete = !confirmDelete" disabled>
            Delete
          </button>

          <button type="submit" class="btn btn-outline-primary" @click="updateProvider" disabled>
            Update
          </button>
        </div>
        <p>{{ message }}</p>
      </div>

      <div v-if="users.length" class="col-sm-6 my-2">
        <h4>Users</h4>
        <ul class="list-group mainlist">
          <li
            class="list-group-item"
            :class="{ active: index == currentUserIndex }"
            v-for="(user, index) in users"
            :key="index"
            @click="setActiveUser(user, index)"
          >
            {{ user.Name }}
          </li>
        </ul>
      </div>
      <div v-else>
        <br />
        <p>Provider has no Users...</p>
      </div>

      <div v-if="users.length && user && user.role" class="col-sm-6">
        <h4>User operations</h4>
      </div>
    </div>

    <div v-if="serviceLists.length" class="edit-form row my-4">
      <div class="col-sm-6">
        <h4>ServiceLists</h4>
        <ul class="list-group mainlist">
          <li
            class="list-group-item"
            :class="{ active: index == currentListIndex }"
            v-for="(list, index) in serviceLists"
            :key="index"
            @click="setActiveList(list, index)"
          >
            {{ list.Names.length ? list.Names[0].name : "Invalid list" }}
          </li>
        </ul>
      </div>

      <div class="col-sm-6">
        <div v-if="currentList">
          <h4>{{ currentList.Names.length ? currentList.Names[0].name : "Invalid list" }} events</h4>

          <ul class="list-group mainlist">
            <li class="list-group-item" v-for="(list, index) in listHistory" :key="index">
              {{ list.Event }} / {{ list.UserName }}: {{ new Date(+list.Time).toLocaleString() }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-else class="edit-form row my-4">
      <br />
      <p>Provider has no Service Lists...</p>
    </div>
  </div>
</template>

<script>
  import ProviderDataService from "../../services/ProviderDataService";
  import ServiceListDataService from "../../services/ServiceListDataService";
  import UserDataService from "../../services/UserDataService";

  export default {
    name: "view-provider",
    data() {
      return {
        currentList: null,
        currentProvider: null,
        currentListIndex: null,
        currentUserIndex: null,
        message: "",
        confirmDelete: false,
        serviceLists: [],
        users: [],
        listHistory: [],
      };
    },
    computed: {
      user() {
        let user = false;
        try {
          user = JSON.parse(sessionStorage.getItem("user"));
        } catch {
          user = false;
        }
        return user;
      },
    },
    methods: {
      getProvider(id) {
        ProviderDataService.get(id)
          .then((response) => {
            this.currentProvider = response.data;

            if (!this.currentProvider.Names) this.currentProvider.Names = [];
            //console.log(response.data);

            // get lists & users
            this.getLists(id);
            this.getUsers(id);
          })
          .catch((e) => {
            console.log(e);
            setTimeout(() => {
              this.$router.push({ name: "providers" });
            }, 2000);
          });
      },
      getLists(id) {
        ServiceListDataService.getByProvider(id)
          .then((response) => {
            this.serviceLists = response.data;
            console.log("lists", response.data);
          })
          .catch((e) => {
            console.log(e);
          });
      },
      getUsers(id) {
        UserDataService.getByProvider(id)
          .then((response) => {
            this.users = response.data;
            console.log("users", response.data);
          })
          .catch((e) => {
            console.log(e);
          });
      },
      getEvents() {
        if (this.currentList) {
          ServiceListDataService.getListHistory(this.currentList.Id)
            .then((response) => {
              if (response.data) {
                this.listHistory = response.data;
              }
            })
            .catch((e) => {
              console.log("history", e);
            });
        }
      },

      updateProvider() {
        const addrstring = JSON.stringify(this.currentProvider.Address);
        const jurisdictionstring = JSON.stringify(this.currentProvider.Jurisdiction);
        const electronicaddrstring = JSON.stringify(this.currentProvider.ElectronicAddress);

        const data = {
          ...this.currentProvider,
          Address: addrstring,
          ElectronicAddress: electronicaddrstring,
          Jurisdiction: jurisdictionstring,
        };

        console.log("POST", this.currentProvider.Id, data);
        return; /*
      ProviderDataService.update(this.currentProvider.Id, data)
        .then(response => {
          console.log(response.data);
          this.message = 'The Provider was updated successfully!'
          setTimeout(() => {
            this.$router.push({ name: "providers" })
          }, 2000)
        })
        .catch(e => {
          console.log(e);
          this.message = "Could not update Provider."
        });*/
      },

      confirmDeleteProvider() {
        this.confirmDelete = !this.confirmDelete;
      },

      deleteProvider() {
        this.confirmDelete = false;
        ProviderDataService.delete(this.currentProvider.Id)
          .then((response) => {
            console.log(response.data);
            this.message = "The Provider was deleted successfully!";
            setTimeout(() => {
              this.$router.push({ name: "providers" });
            }, 2000);
          })
          .catch((e) => {
            console.log(e);
            this.message = "Could not delete Provider.";
          });
      },

      setActiveList(list, index) {
        this.currentList = list;
        this.currentListIndex = list ? index : -1;
        try {
          this.Delivery = JSON.parse(list.Delivery).join(", ");
        } catch {
          this.Delivery = list.Delivery;
        }

        if (this.currentList) this.getEvents();
      },
      setActiveUser(user, index) {
        this.currentUser = user;
        this.currentUserIndex = user ? index : -1;
      },
    },

    mounted() {
      this.message = "";
      this.getProvider(this.$route.params.id);
    },
  };
</script>

<style scoped>
  .edit-form {
    text-align: left;
    max-width: 1050px;
    margin: auto;
  }
  .test-form {
    background: rgb(39, 39, 39);
    border-radius: 0.5rem;
  }
  .mainlist {
    max-height: 50vh;
    overflow-y: scroll;
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
