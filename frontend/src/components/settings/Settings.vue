<template>
  <div class="list row">
    <h4>Generate content</h4>
    <div class="col-md-8">
      <div class="input-group mb-3">
        <label for="providers">Number of providers to generate</label>
        <input id="providers" type="number" class="form-control" placeholder="Providers"
          v-model="providers"/>
        <label for="lists">Number of servicelists per provider</label>
        <input id="lists" type="number" class="form-control" placeholder="Servicelists per providers"
          v-model="servicelists"/>
        <div class="input-group mb-3">
           <button class="btn btn-outline-secondary" type="button"
            @click="generateData"
          >
            Generate test data
          </button>
        </div>
      </div>

      

    </div>
  </div>

  <div class="row">
    <div class="col-md-6">
      <h4>List event history</h4>
      <div class="row">         
          <ul class="list-group mainlist">
            <li class="list-group-item"
              :class="{ active: index == currentIndex }"
              v-for="(list, index) in lists"
              :key="index"
              @click="setActiveList(list, index)"
            >
              {{ list.Name }}
            </li>
          </ul>
      </div>
    </div>

    <div class="col-md-6">
      <div v-if="currentList">
        <h4>{{currentList.Name}}</h4>
        
        <ul class="list-group">
          <li class="list-group-item"
            v-for="(list, index) in listHistory"
            :key="index"
          >
           {{list.Event}} / {{list.UserName}}: {{new Date(+list.Time).toLocaleString() }}
          </li>
        </ul>

      </div>
      <div v-else>
        <br />
        <p>Please click on a Service List...</p>
      </div>
    </div>

  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService"
import ServiceListDataService from "../../services/ServiceListDataService"
import countries from "../../../../common/countries"
import { deliveries, genres } from "../../../../common/dev_constants"
import languages from "../../../../common/languages"
import LoginService from "../../services/LoginService"

export default {
  name: "settings",
  data() {
      return {
          providers: 2,
          servicelists: 5,
          lists: [],
          currentList: null,
          currentIndex: -1,
          listHistory: [],
      };
  } ,
  methods: {
    fetchLists() {
      ServiceListDataService.getAll()
        .then(response => {
          if(response.data) {
            this.lists = response.data;
          }
        })
        .catch(e => {
          console.log("lists", e);

          // TODO: move this handler the service module
          LoginService.reset()
        });
    },
    fetchHistory() {
      if(this.currentList) {
        ServiceListDataService.getListHistory(this.currentList.Id)
          .then(response => {
            if(response.data) {
              this.listHistory = response.data;
            }
          })
          .catch(e => {
            console.log("history", e);
          });
      }
    },
    setActiveList(list, index) {
      this.currentList = list;
      this.currentIndex = list ? index : -1;
      if(this.currentList) this.fetchHistory()
    },


    generateData() {
      console.log("genrateData");
      ProviderDataService.getAll()
        .then(response => {
          let providerList = response.data;
          const kinds = ["NGO","company","broadcaster"];
          for(var z = 0;z < this.providers;z++) {       
            const providerNumber = providerList.length+1+z; 
            const keys = Object.keys(countries);
            let value = keys[Math.floor(Math.random() * keys.length)]
            const addrstring = JSON.stringify({street: "Examplestreet "+providerNumber,city:"Exampletown",postcode: "00000",country: countries[value].name});
            const data = {
              Kind: kinds[Math.floor(Math.random() * kinds.length)],
              Names: [{name: "Test provider "+providerNumber, type: ""},{name: "TP"+providerNumber, type: "variant"}],
              ContactName: "Contact Name "+providerNumber,
              Jurisdiction: "Test location",
              Address: addrstring,
              ElectronicAddress: "example_contact"+providerNumber+"@example.com",
              Regulator: Math.round(Math.random()),
            }    
            console.log("add provider:", data)
            ProviderDataService.create(data)
            .then(response => {
              for(let i = 0; i < this.servicelists;i++) {
                let languageList = [];
                let delivertyList = [];
                let countryList = [];
                let genreList = [];
                let provider = response.data.id;
                let regulator =  Math.round(Math.random());
                let rand = Math.floor(Math.random() * 5);
                let keys = Object.keys(languages);
                for(let j = 0;j < rand;j++) {
                  let value = keys[Math.floor(Math.random() * keys.length)]
                  languageList.push({name: languages[value].name, a3: value});
                }
                rand = Math.floor(Math.random() * 2);
                for(let j = 0;j < rand;j++) {
                  let value = deliveries[Math.floor(Math.random() * deliveries.length)]
                  delivertyList.push(value);
                }
                rand = Math.floor(Math.random() * 5);
                keys = Object.keys(countries);
                for(let j = 0;j < rand;j++) {
                  let value = keys[Math.floor(Math.random() * keys.length)]
                  countryList.push({name: countries[value].name, code: value});
                }
                rand = Math.floor(Math.random() * 5);
                keys = Object.keys(genres);
                for(let j = 0;j < rand;j++) {
                  let value = keys[Math.floor(Math.random() * keys.length)]
                  genreList.push({name: genres[value].name, value: value});
                }
                const data = {
                    Name: "Provider "+providerNumber+" ServiceList "+(i+1),
                    URI: "https://serviceprovider-"+providerNumber+".net/servicelist"+i+".xml",
                    lang: languageList,
                    Provider: provider,
                    regulatorList: regulator,
                    Delivery: delivertyList,
                    Countries: countryList,
                    Genres: genreList
                } 
                ServiceListDataService.create(data)
                    .then(response => {
                        console.log(response);
                        console.log(i,z,this.servicelists,this.providers);
                        if(z == this.providers && i+1 == this.servicelists) {
                          this.$router.push({ name: "providers" });
                        }
                    })
                    .catch(err => {
                        console.log("error creating list",err);
                    });
              }
            })
            .catch(err => {
                console.log("error creating provider",err);
            });
            
            }
      
        });
    },

  },
  mounted() {
    this.fetchLists()
  }
}
</script>

<style>
.mainlist {
  max-height: 50vh;  
  overflow-y: scroll;
}
</style>