<template>
<div class="list">
  <div class="row">
    <div class="col-md-8">
      <div class="btn-group btn-group-sm mb-2 " role="group" aria-label="Basic radio toggle button group">
          <input type="radio" class="btn-check" name="btnradio" id="btnradioName" autocomplete="off" @change="filterRadio" :checked="filterType == 1">
          <label class="btn btn-outline-primary" for="btnradioName">Name</label>
  
          <input type="radio" class="btn-check" name="btnradio" id="btnradioRegulator" autocomplete="off" @change="filterRadio" :checked="filterType == 2">
          <label class="btn btn-outline-primary" for="btnradioRegulator">Regulator</label>

          <input type="radio" class="btn-check" name="btnradio" id="btnradioNoRegulator" autocomplete="off" @change="filterRadio" :checked="filterType == 3">
          <label class="btn btn-outline-primary" for="btnradioNoRegulator">Not Regulator</label>
        </div>
        <div class="input-group mb-4">
          <input type="text" class="form-control" placeholder="Filter by..." 
            v-model="title"/>
        </div>
    </div>
    <div class="col-md-6">
      <h4>Provider List</h4>
      <ul class="list-group mainlist">
        <li class="list-group-item"
          :class="{ active: index == currentIndex }"
          v-for="(provider, index) in filteredList"
          :key="index"
          @click="setActiveProvider(provider, index)"
        >
          {{ provider.Names[0] ? provider.Names[0].name : "No name" }}
        </li>
      </ul>
    </div>
    <div class="col-md-6">
      <div v-if="currentProvider">
        <h4>Provider</h4>
        <div>
          <label><strong>Kind:</strong></label> {{ currentProvider.Kind || "Not defined" }}
        </div>
        <div>
          <label><strong>Organization name:</strong></label> {{ currentProvider.Names[0] && currentProvider.Names[0].name != "" ? currentProvider.Names[0].name : "No name" }} {{ currentProvider.Names[0] && currentProvider.Names[0].type != "" ? "(Type:" +currentProvider.Names[0].type+")" : ""}}
        </div>
        <div>
          <label><strong>Contact name:</strong></label> {{ currentProvider.ContactName || "Not defined" }}
        </div>
         <div>
          <label><strong>Jurisdiction:</strong></label> {{ currentProvider.Jurisdiction || "Not defined" }}
        </div>
         <div>
          <label><strong>Address:</strong></label> {{ currentProvider.Address.trim() != '' ? currentProvider.Address : "Not defined" }}
        </div>
         <div>
          <label><strong>Electronic address:</strong></label> {{ currentProvider.ElectronicAddress || "Not defined" }}
        </div>
        <div>
          <label><strong>Regulator:</strong></label> {{ currentProvider.Regulator ? "Yes" : "No" }}
        </div>

        <router-link :to="'/providers/' + currentProvider.Id" class="btn btn-outline-primary mt-1">Edit</router-link>
        <div v-if="user && user.role">
          <router-link :to="'/admin/provider/' + currentProvider.Id" class="btn btn-outline-primary mt-1">View</router-link>
        </div>
        
      </div>
      <div v-else>
        <br />
        <p>Please click on a Provider...</p>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService"
import LoginService from "../../services/LoginService"
export default {
  name: "provider-list",
  data() {
    return {
      providers: [],
      currentProvider: null,
      currentIndex: -1,
      filterType: 1,
      title: ""
    };
  },
  computed: {
    user() {
      let user = false
      try {
        user = JSON.parse(sessionStorage.getItem('user'))
      }
      catch {
        user = false
      }
      return user
    },
    filteredList() {
      let ll = this.providers.filter(elem => {
        switch(this.filterType) {
          case 1: {
            return elem.Names.find(el => {
                return el.name.toLowerCase().includes(this.title.toLowerCase())
              })
            }
          case 2: return elem.Regulator
          case 3: return !elem.Regulator
          default: return null
        }
      })
      return ll
    }
  },
  methods: {
    retrieveProviders() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
          this.providers.forEach(pr => {
            
             try {
              let jurisdiction = JSON.parse(pr.Jurisdiction)
              pr.Jurisdiction = jurisdiction.Name + " " + jurisdiction.AddressLine[0] + " " + jurisdiction.AddressLine[1] + " " + jurisdiction.AddressLine[2]
            } catch (err) {
              pr.Jurisdiction = "";
            }
            // parse address objects
            try {
              let addr = JSON.parse(pr.Address)
              pr.Address = addr.Name + " " + addr.AddressLine[0] + " " + addr.AddressLine[1] + " " + addr.AddressLine[2]
            } catch (err) {
              pr.Address = "";
            }

            try {
              let electronicaddr = JSON.parse(pr.ElectronicAddress)
              pr.ElectronicAddress = "Tel:"+electronicaddr.Telephone + " Fax:" + electronicaddr.Fax + " Email:" + electronicaddr.Email + " Url:" + electronicaddr.Url
            } catch (err) {
              pr.ElectronicAddress = "";
            }

          })
          //console.log(response.data);
        })
        .catch(e => {
          console.log(e);
          // TODO: move this handler the service module
          // error with fetch (unauthorized)
          // clear session data & re-login
          LoginService.reset()
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
      //console.log(this.currentProvider)
    },

    filterRadio(item) {
      if(item.target.id === "btnradioName") this.filterType = 1
      if(item.target.id === "btnradioRegulator") this.filterType = 2
      if(item.target.id === "btnradioNoRegulator") this.filterType = 3

      this.currentProvider = null
      this.currentIndex = -1
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

<style scoped>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
.mainlist {
  max-height: 70vh;  
  overflow-y: scroll;
}
</style>