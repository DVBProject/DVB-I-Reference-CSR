<template>
  <div class="list row">
    <div class="col-md-8">
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="Search by title"
          v-model="title"/>
        <div class="input-group-append">
          <button class="btn btn-outline-secondary" type="button"
            @click="searchTitle"
          >
            Search
          </button>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <h4>Provider List</h4>
      <ul class="list-group">
        <li class="list-group-item"
          :class="{ active: index == currentIndex }"
          v-for="(provider, index) in providers"
          :key="index"
          @click="setActiveProvider(provider, index)"
        >
          {{ provider.Kind }}
        </li>
      </ul>
    </div>
    <div class="col-md-6">
      <div v-if="currentProvider">
        <h4>Provider</h4>
        <div>
          <label><strong>Kind:</strong></label> {{ currentProvider.Kind }}
        </div>
        <div>
          <label><strong>Organization name:</strong></label> {{ currentProvider.Names[0].name }}
        </div>
        <div>
          <label><strong>Organization type:</strong></label> {{ currentProvider.Names[0].type }}
        </div>
        <div>
          <label><strong>Contact name:</strong></label> {{ currentProvider.ContactName }}
        </div>
         <div>
          <label><strong>Jurisdiction:</strong></label> {{ currentProvider.Jurisdiction }}
        </div>
         <div>
          <label><strong>Address:</strong></label> {{ currentProvider.Address }}
        </div>
         <div>
          <label><strong>Electronic address:</strong></label> {{ currentProvider.ElectronicAddress }}
        </div>
        <div>
          <label><strong>Regulator:</strong></label> {{ currentProvider.Regulator ? "True" : "False" }}
        </div>

        <router-link :to="'/providers/' + currentProvider.Id" class="badge alert-warning">Edit</router-link>
      </div>
      <div v-else>
        <br />
        <p>Please click on a Provider...</p>
      </div>
    </div>
  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService"
export default {
  name: "provider-list",
  data() {
    return {
      providers: [],
      currentProvider: null,
      currentIndex: -1,
      title: ""
    };
  },
  methods: {
    retrieveProviders() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
          this.providers.forEach(pr => {
            
            // parse address objects
            try {
              let addr = JSON.parse(pr.Address)
              pr.Address = addr.street + " " + addr.city + " " + addr.postcode + " " + addr.country
              console.log(pr.Address)
            } catch (err) {
              //console.log(err)
            }

          })
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    refreshList() {
      this.retrieveProviders();
      this.currentProvider = null;
      this.currentIndex = -1;
    },
    setActiveProvider(provider, index) {
      this.currentProvider = provider;
      this.currentIndex = provider ? index : -1;
    },
    
    searchTitle() {
      ProviderDataService.findByTitle(this.title)
        .then(response => {
          this.providers = response.data;
          this.setActiveProvider(null);
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  mounted() {
    this.retrieveProviders();
  }
};
</script>

<style>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>