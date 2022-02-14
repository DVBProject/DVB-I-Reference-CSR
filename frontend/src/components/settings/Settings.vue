<template>
  <div>
    <div class="col-sm-8" v-if="this.provider">
      <h4>CSR Provider Information</h4>
      <form>
        <label>Organization Names:</label>
        <button class="btn btn-outline-primary mx-2 mb-1" type="button"
              @click="addNameField"
            >
          +
        </button>
        <div class="input-group mb-3">

          
          <div class="col-sm-12 px-0"
              v-for="(name, index) in provider.Names"
              :key="index">      

            <div class="row my-0 mx-0">

              <div class="form-floating px-0 col-sm-5">          
                <input type="text" id="floatingInput" class="form-control mb-1" placeholder="Name"
                    v-model="name.name"/>
                <label for="floatingInput">Name</label>
              </div>

              <div class="form-floating px-0 col-sm-5">
                <input type="text" id="floatingInput2" class="form-control mx-2 mb-1" placeholder="Type"
                    v-model="name.type"/>
                <label for="floatingInput2">Type</label>
              </div>

              <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
                :id="index"
                @click="delNameField"
              >
                -
              </button>
            </div>

          </div>        
        </div>

        <div class="form-group">
          <label>Organization Kind:</label>
          <input type="text" class="form-control my-2" placeholder="Kind"
              v-model="provider.Kind"/>
        </div>
        
        <div class="form-group">
          <label for="description">Contact name:</label>
          <input type="text" class="form-control my-2" id="contactname"
            v-model="provider.ContactName"
          />
        </div>
        <div class="form-group">
          <label for="description">Jurisdiction:</label>
          <div class="form-floating mb-1">
          <input type="text" id="jurisdictionInputName" class="form-control my-2" placeholder="Name"
              v-model="provider.Jurisdiction.Name"/>
          <label for="jurisdictionInputName">Name</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="jurisdictionInputLine1" class="form-control my-2" placeholder="Address line 1"
                v-model="provider.Jurisdiction.AddressLine[0]"/>
            <label for="jurisdictionInputLine1">Address line 1</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="jurisdictionInputLine2" class="form-control my-2" placeholder="Address line 3"
                v-model="provider.Jurisdiction.AddressLine[1]"/>
            <label for="jurisdictionInputLine2">Address line 2</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="jurisdictionInputLine3" class="form-control my-2" placeholder="Address line 3"
                v-model="provider.Jurisdiction.AddressLine[2]"/>
            <label for="jurisdictionInputLine1">Address line 3</label>
          </div>
        </div>
        
        <label for="description">Address:</label>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputStreet" class="form-control my-2" placeholder="Name"
              v-model="provider.Address.Name"/>
          <label for="floatingInputStreet">Name</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputCity" class="form-control my-2" placeholder="Addres line 1"
              v-model="provider.Address.AddressLine[0]"/>
          <label for="floatingInputCity">Addres line 1</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputCity" class="form-control my-2" placeholder="Addres line 3"
              v-model="provider.Address.AddressLine[1]"/>
          <label for="floatingInputCity">Addres line 2</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputCity" class="form-control my-2" placeholder="Addres line 3"
              v-model="provider.Address.AddressLine[2]"/>
          <label for="floatingInputCity">Addres line 3</label>
        </div>

        <div class="form-group">
          <label for="description">Electronic Address:</label>
           <div class="form-floating mb-1">
          <input type="text" id="floatingInputTelephone" class="form-control my-2" placeholder="Telephone"
              v-model="provider.ElectronicAddress.Telephone"/>
          <label for="floatingInputStreet">Telephone</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="floatingInputFax" class="form-control my-2" placeholder="Fax"
                v-model="provider.ElectronicAddress.Fax"/>
            <label for="floatingInputCity">Fax</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="floatingInputEmail" class="form-control my-2" placeholder="Email"
                v-model="provider.ElectronicAddress.Email"/>
            <label for="floatingInputPC">Email</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="floatingInputUrl" class="form-control my-2" placeholder="Url"
                v-model="provider.ElectronicAddress.Url"/>
            <label for="floatingInputCountry">Url</label>
          </div>

        </div>

        <div class="form-group">
          <label for="description">Regulator:</label><br>
          <div class="btn-group btn-group-sm my-2" role="group" aria-label="Basic radio toggle button group">
            <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" :checked="provider.Regulator">
            <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
    
            <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio" :checked="!provider.Regulator">
            <label class="btn btn-outline-primary" for="btnradioNo">No</label>
          </div>
        </div>
        <div class="input-group mb-3">
          <button class="btn btn-outline-secondary" type="button"
            @click="updateProvider"
          >Save
          </button>
        </div>


      </form>

    </div>
  <div class="row">
    <div class="col-md-6">
      <h4>Generate content</h4>
      <div class="col-md-5">
        <div class="form-group">
          <label for="providers">Number of providers to generate</label>
          <input id="providers" type="number" size="3" class="form-control" placeholder="Providers"
            v-model="providers"/>
        </div>
        <div class="form-group">
          <label for="lists">Number of servicelists per provider</label>
          <input id="lists" type="number" size="3" class="form-control" placeholder="Servicelists per providers"
            v-model="servicelists"/>
        </div>
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


  </div>
</template>

<script>
/*
  <div class="row">
    <div class="col-md-6">
      <h4>List event history</h4>
               
          <ul class="list-group historyList">
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

    <div class="col-md-6">
      <div v-if="currentList">
        <h4>{{currentList.Name}}</h4>
        
        <ul class="list-group historyList">
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

  </div> */
import ProviderDataService from "../../services/ProviderDataService"
import ServiceListDataService from "../../services/ServiceListDataService"
import ListProviderDataService from "../../services/ListProviderDataService"
import countries from "../../../../common/countries"
import { deliveries, genres } from "../../../../common/dev_constants"
import languages from "../../../../common/languages"
import LoginService from "../../services/LoginService"

export default {
  name: "settings-view",
  data() {
      return {
          providers: 2,
          servicelists: 5,
          lists: [],
          currentList: null,
          currentIndex: -1,
          listHistory: [],
          providerList: [],
          provider: null,
      };
  } ,
  methods: {
    fetchLists() {
      ServiceListDataService.getAll()
        .then(response => {
          if(response.data) {
            this.lists = response.data;
            //console.log("lists", this.lists)
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
    fetchByProvider() {
      // now only for debugging the backend
      ServiceListDataService.getByProvider(5)
        .then(response => {
            if(response.data) {
              this.providerList = response.data;
              //console.log("pp", this.providerList)
            }
          })
          .catch(e => {
            console.log("by provider", e);
          })
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
            const addrstring = JSON.stringify({Name: "",AddressLine:["Examplestreet "+providerNumber,"Exampletown 00000",countries[value].name]});
            const data = {
              Kind: kinds[Math.floor(Math.random() * kinds.length)],
              Names: [{name: "Test provider "+providerNumber, type: ""},{name: "TP"+providerNumber, type: "variant"}],
              ContactName: "Contact Name "+providerNumber,
              Jurisdiction: JSON.stringify({Name: "",AddressLine:["","",""]}),
              Address: addrstring,
              ElectronicAddress: JSON.stringify({Telephone:"",Email:"example_contact"+providerNumber+"@example.com",Fax: "",Url: ""}),
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
                    Names: [{name: "Provider "+providerNumber+" ServiceList "+(i+1),lang: ""}],
                    URI: "https://serviceprovider-"+providerNumber+".net/servicelist"+i+".xml",
                    lang: languageList,
                    Provider: provider,
                    regulatorList: regulator,
                    Delivery: delivertyList,
                    Countries: countryList,
                    Genres: genreList,
                    Status: ""
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
    addNameField() {
      this.provider.Names.push({name: "", type: ""})
    },
    delNameField(item) {
      this.provider.Names.splice(item.target.id, 1)
    },
    fetchListprovider() {
      ListProviderDataService.get()
        .then(response => {
          if(response.data) {
            this.provider = response.data;
            try {
              this.provider.Address = JSON.parse(response.data.Address);
              if(!Object.prototype.hasOwnProperty.call(this.provider.Address,"AddressLine")) {
                throw "Invalid address";
              }
            } catch(e) {
              console.log(e);
              this.provider.Address = {Name: "",AddressLine: ["","",""]};
            }

            try {
              this.provider.Jurisdiction = JSON.parse(response.data.Jurisdiction);
              if(!Object.prototype.hasOwnProperty.call(this.provider.Jurisdiction,"AddressLine")) {
                throw "Invalid address";
              }
            } catch(e) {
              console.log(e);
              this.provider.Jurisdiction = {Name: "",AddressLine: ["","",""]};
            }
            try {
              this.provider.ElectronicAddress = JSON.parse(response.data.ElectronicAddress);
              if(!Object.prototype.hasOwnProperty.call(this.provider.ElectronicAddress,"Email")) {
                throw "Invalid electronic address";
              }
            } catch(e) {
              console.log(e);
              this.provider.ElectronicAddress = {Telephone: "",Fax: "",Email:"",Url: ""};
            }
            console.log(this.provider);
          }
        })
        .catch(e => {
          console.log("lists", e);

          // TODO: move this handler the service module
          LoginService.reset()
        });
    },
    updateProvider() {
      const addrstring = JSON.stringify(this.provider.Address)
      const jurisdictionstring = JSON.stringify(this.provider.Jurisdiction)
      const electronicaddrstring = JSON.stringify(this.provider.ElectronicAddress)

      const data = {
            ...this.provider,
            Address: addrstring,
            Jurisdiction: jurisdictionstring,
            ElectronicAddress: electronicaddrstring
        }

      //console.log("POST",this.currentProvider.Id, data)
      ListProviderDataService.update( data) 
        .then(response => {
          console.log(response.data);
          this.message = 'The Provider was updated successfully!'
        })
        .catch(e => {
          console.log(e);
          this.message = "Could not update Provider."
        });
    },
  },
  mounted() {
    this.fetchLists()
    this.fetchByProvider()
    this.fetchListprovider();
  }
}
</script>

<style scoped>

.historyList {
  max-height: 45vh;  
  overflow-y: scroll;
}
</style>