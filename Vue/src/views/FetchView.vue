<template>
  <main class="fetch">
    <h2>Fetch Example</h2>
    <p>
      Below we have a table of historical data on
      <a
        href="https://fiscaldata.treasury.gov/datasets/record-setting-auction-data/record-setting-auction"
        >record setting auctions of different financial security types</a
      >. This dataset was chosen for its digestible size, and the fact that the
      API was completely free to use without any restrictions (making it good
      for this sort of demonstration).
    </p>
    <label>
      Security Type:
      <select name="type" id="type" v-model="selectedSecurityType">
        <option
          v-for="securityType in securityTypes"
          :key="securityType"
          :value="securityType"
        >
          {{ securityType }}
        </option>
      </select>
    </label>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Highest Offer Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in displayData" :key="row.month">
          <td>{{ row.date }}</td>
          <td>${{ row.value }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { monthNames } from "../util/constants";

// the three financial security types in our api's dataset
const securityTypes = ["CMBs", "Bills", "Bonds", "FRNs", "Notes", "TIPS"];

// store the selected value in the dropdown
const selectedSecurityType = ref(securityTypes[0]);

// store the endpoint for our api request
const url = computed(
  () =>
    `https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/record_setting_auction?sort=-record_date&filter=security_type%3Aeq%3A${selectedSecurityType.value}&fields=record_date,high_offer_amt`
);

// store all of the data from our api request. by default, there is no data, so this is an empty ref
const data = ref();

// whenever the url changes, re-run the watcher callback which performs the fetch
watch(
  url,
  async (url, _, onCleanup) => {
    //#region abortcontroller
    // this is somewhat intermediate so feel free to skip, but an abort controller enables
    // javascript to tell the browser when an asynchronous operation (such as fetching)
    // should be cancelled for some reason. in our case here, if the user switches
    // the commodity value in the dropdown once, and then again before the api
    // request finishes, we can safely skip it because we need to make a new
    // request for the new selected value. we detect when the value of url
    // changes more than once by passing a callback to onCleanup(), which
    // will run the next time url changes
    const controller = new AbortController();
    onCleanup(() => {
      controller.abort();
    });
    //#endregion

    // actually perform the fetch
    fetch(url, { signal: controller.signal })
      // convert the response from the server into JSON data
      .then((res) => res.json())
      // save the data to our data ref
      .then((apiData) => {
        data.value = apiData;
      });
  },
  // run this watcher the first time the code runs. otherwise, the function would
  // not be called until the user changed their selection and therefore the url
  { immediate: true }
);

// take 25 of the data points from the API, if there is a value in our data ref
// otherwise, return an empty array
const records = computed(() => {
  if (data.value) {
    return data.value.data.slice(0, 25);
  } else {
    return [];
  }
});

// convert each item in records (noting that for this code, we don't need to worry about unfetched data!)
// into an object that has a formatted date and the value we want to display
const displayData = computed(() =>
  records.value.map((value) => {
    const date = new Date(`${value.record_date}T00:00:00`);
    return {
      date: date.toLocaleDateString(),
      value: Number(value.high_offer_amt).toFixed(2),
    };
  })
);
</script>

<style>
/* add padding around the page */
.fetch {
  padding: 1rem;
}

/* make the heading font larger and add spacing below */
.fetch h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

/* add spacing below the text */
.fetch p {
  margin-bottom: 1rem;
}

/* add borders to the table and its top row */
.fetch table,
.fetch thead {
  border: 1px solid #d9d9d9;
}

/* setup the spacing and the text alignment of the table headers and table cells */
.fetch :is(th, td) {
  text-align: left;
  padding: 0.25rem 0.75rem;
  min-width: 10rem;
}

/* make even numbered rows an off-white color to make the table more legible */
.fetch tr:nth-child(even) {
  background-color: #f9f9f9;
}
</style>
