 <template>
  <div v-if="currentList" class="edit-form">
    <h4>Provider</h4>
    <form>
      <div class="form-group">
        <label for="title">Name</label>
        <input type="text" class="form-control" id="Name"
          v-model="currentList.Name"
        />
      </div>
      <div class="form-group">
        <label for="description">Provider</label>
        <input type="text" class="form-control" id="Provider"
          v-model="currentList.Provider"
        />
      </div>
       <div class="form-group">
        <label for="description">Language</label>
        <input type="text" class="form-control" id="language"
          v-model="currentList.lang"
        />
      </div>
       <div class="form-group">
        <label for="description">URI</label>
        <input type="text" class="form-control" id="URI"
          v-model="currentList.URI"
        />
      </div>
       <div class="form-group">
        <label for="description">Delivery</label>
        <input type="text" class="form-control" id="delivery"
          v-model="currentList.delivery"
        />
      </div>
       <div class="form-group">
        <label for="description">Regulator List</label>
        <input type="checkbox" class="form-check-input" id="regulatorList"
          v-model="currentList.regulatorList"
        />
      </div>


    </form>



    <button class="badge badge-danger mr-2"
      @click="deleteList"
    >
      Delete
    </button>

    <button type="submit" class="badge badge-success"
      @click="updateList"
    >
      Update
    </button>
    <p>{{ message }}</p>
  </div>

  <div v-else>
    <br />
    <p>Service List was not found...</p>
  </div>
</template>

<script>
import ServiceListDataService from "../../services/ServiceListDataService"
export default {
  name: "servicelist-edit",
  data() {
    return {
      currentList: null,
      message: ''
    };
  },
  methods: {
    getList(id) {
      ServiceListDataService.get(id)
        .then(response => {
          this.currentList = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    updateList() {
        console.log("POST",this.currentList.Id, this.currentList);
      ServiceListDataService.update(this.currentList.Id, this.currentList)
        .then(response => {
          console.log(response.data);
          this.message = 'The list was updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
    },
    deleteList() {
      ServiceListDataService.delete(this.currentList.Id)
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
    this.getList(this.$route.params.id);
  }
};
</script>

<style>
.edit-form {
  max-width: 300px;
  margin: auto;
}
</style>