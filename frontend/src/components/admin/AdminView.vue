<template>

  <div class="list">
    <div class="row">

      <div class="col-md-8">
        <div class="btn-group btn-group-sm mb-2 " role="group" aria-label="Basic radio toggle button group">            
          
          <router-link :to="'/admin/add-user/'" class="btn btn-outline-primary mt-1">Create new</router-link>
        </div>
      </div>
      
      <div class="col-md-6 mt-3">
        <h4>Users</h4>
        <ul class="list-group userlist">
          <li class="list-group-item"
            :class="{ active: index == currentIndex }"
            v-for="(user, index) in users"
            :key="index"
            @click="setActiveUser(user, index)"
          >
            {{ user.Name }}

          </li>
        </ul>
      </div>
      <div class="col-md-6 mt-3">
        <div v-if="currentUser">
          <h4>Selected User</h4>
          <div>
            <label class="mx-1"><strong>Name:</strong></label> {{ currentUser.Name || "Not defined" }}
          </div>
          <div>
            <label class="mx-1"><strong>Role:</strong></label> {{ currentUser.Role || "Not defined" }}
          </div>
          <div>
            <label class="mx-1"><strong>e-mail:</strong></label> {{ currentUser.Email || "Not defined" }}
          </div>
          <div>
            <label class="mx-1"><strong># Providers:</strong></label> {{ currentUser.Providers.length ||"Not defined" }}
          </div>

          <router-link :to="'/admin/user/' + currentUser.Id" class="btn btn-outline-primary mt-1">Edit</router-link>
        </div>
        <div v-else>
          <br />
          <p>Please select from the list...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import UserDataService from "../../services/UserDataService"


export default {
  name: "admin-view",
  data() {
    return {
      users: [],
      currentUser: null,
      currentIndex: -1,
      filterType: 1,
      title: "",
      Delivery: ""
    };
  },
  computed: {
  },
  methods: {
    retrieveUsers() {
      UserDataService.getAll()
        .then(response => {
          this.users = response.data;
          this.users.forEach(user => {
            try {
              user.Providers = JSON.parse(user.Providers)
            } catch {
              user.Providers = []
            }
          })
          console.log(response.data);
        })
        .catch(e => {
            console.log(e);

            setTimeout(() => {
                this.$router.push({ name: "servicelists" });
            }, 1000)
        });
    },
    setActiveUser(user, index) {
      this.currentUser = user      
      this.currentIndex = user ? index : -1    
    },

  },
  mounted() {
    this.retrieveUsers();
  }
};
</script>

<style scoped>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
.userlist {
  max-height: 30vh;  
  overflow-y: scroll;
}
</style>