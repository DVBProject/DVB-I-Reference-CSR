<template>
  <div class="list row">
      

    <div class="col-md-8">
      <h4>Add Provider</h4>

      <label>Kind:</label>
      <input type="text" class="form-control my-2" placeholder="Kind"
          v-model="Kind"/>

      <label>Organization Name:</label>
      <input type="text" class="form-control my-2" placeholder="Name"
          v-model="Name"/>

      <label>Organization Type:</label>
      <input type="text" class="form-control my-2" placeholder="Type"
          v-model="Type"/>

      <label>Contact Name:</label>
      <input type="text" class="form-control my-2" placeholder="Contact Name"
          v-model="ContactName"/>

      <label>Jurisdiction:</label>
      <input type="text" class="form-control my-2" placeholder="Jurisdiction"
          v-model="Jurisdiction"/>

      <label>Address:</label>
      <input type="text" class="form-control my-2" placeholder="Address"
          v-model="Address"/>

      <label>Electronic Address:</label>
      <input type="text" class="form-control my-2" placeholder="ElectronicAddress"
          v-model="ElectronicAddress"/>

      <label>Regulator:</label>
      <select class="form-control my-2"
          v-model="Regulator">
        <option value=1>Yes</option>
        <option value=0>No</option>
      </select>

  
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

    <div class="col-md-4">
      <div v-if="currentProvider">
        <h4>Provider</h4>
        <div>
          <label><strong>Kind:</strong></label> {{ currentProvider.Kind }}
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
        <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button"
            @click="addProvider">
            Add Provider
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService"
export default {
  name: "add-provider",
  data() {
    return {
      providers: [],
      currentProvider: null,
      currentIndex: -1,
      Kind: "",
      Name: "",
      Type: "",
      ContactName: "",
      Jurisdiction: "",
      Address: "",
      ElectronicAddress: "",
      Regulator: 0,      
    };
  },
  methods: {
    retrieveProviders() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
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
    
    addProvider() {
        const data = {
            Kind: this.Kind,
            name: this.Name,
            type: this.Type,
            ContactName: this.ContactName,
            Jurisdiction: this.Jurisdiction,
            Address: this.Address,
            ElectronicAddress: this.ElectronicAddress,
            Regulator: this.Regulator,
        } 
        //console.log("add provider:", data)

        ProviderDataService.create(data)
            .then(response => {
                console.log(response)
            })
            .catch(err => {
                console.log(err);
            });
    }
    /*
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
    } */
  },
  mounted() {
    //this.retrieveProviders();
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