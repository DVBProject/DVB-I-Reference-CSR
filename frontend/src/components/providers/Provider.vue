 <template>
  <div v-if="currentProvider" class="edit-form">
    <h4>Provider</h4>
    <form>
      <div class="form-group">
        <label for="title">Kind</label>
        <input type="text" class="form-control" id="kind"
          v-model="currentProvider.Kind"
        />
      </div>

      <div class="form-group">
        <label for="description">Organization name</label>
        <input type="text" class="form-control" id="name"
          v-model="currentProvider.name"
        />
      </div>
      <div class="form-group">
        <label for="description">Organization type</label>
        <input type="text" class="form-control" id="type"
          v-model="currentProvider.type"
        />
      </div>
      <div class="form-group">
        <label for="description">Contactname</label>
        <input type="text" class="form-control" id="contactname"
          v-model="currentProvider.ContactName"
        />
      </div>
       <div class="form-group">
        <label for="description">Jurisdiction</label>
        <input type="text" class="form-control" id="jurisdiction"
          v-model="currentProvider.Jurisdiction"
        />
      </div>
       <div class="form-group">
        <label for="description">Address</label>
        <input type="text" class="form-control" id="contactname"
          v-model="currentProvider.Address"
        />
      </div>
       <div class="form-group">
        <label for="description">Electronic Address</label>
        <input type="text" class="form-control" id="electronicaddress"
          v-model="currentProvider.ElectronicAddress"
        />
      </div>
       <div class="form-group">
        <label for="description">Regulator</label>
        <input type="checkbox" class="form-check-input" id="regulator"
          v-model="currentProvider.Regulator"
        />
      </div>


    </form>



    <button class="badge badge-danger mr-2"
      @click="deleteProvider"
    >
      Delete
    </button>

    <button type="submit" class="badge badge-success"
      @click="updateProvider"
    >
      Update
    </button>
    <p>{{ message }}</p>
  </div>

  <div v-else>
    <br />
    <p>Please click on a Provider...</p>
  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService";
export default {
  name: "tutorial",
  data() {
    return {
      currentProvider: null,
      message: ''
    };
  },
  methods: {
    getProvider(id) {
      ProviderDataService.get(id)
        .then(response => {
          this.currentProvider = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    updateProvider() {
        console.log("POST",this.currentProvider.Id, this.currentProvider);
      ProviderDataService.update(this.currentProvider.Id, this.currentProvider)
        .then(response => {
          console.log(response.data);
          this.message = 'The tutorial was updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
    },
    deleteProvider() {
      ProviderDataService.delete(this.currentProvider.Id)
        .then(response => {
          console.log(response.data);
          this.$router.push({ name: "tutorials" });
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  mounted() {
    this.message = '';
    this.getProvider(this.$route.params.id);
  }
};
</script>

<style>
.edit-form {
  max-width: 300px;
  margin: auto;
}
</style>