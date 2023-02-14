const hubspot = require('@hubspot/api-client');

exports.main = async (event) => {

  const hubspotClient = new hubspot.Client({
    accessToken: process.env.apiKey
  });
  
  const email = event.inputFields['person_email'];
  
  const firstName = event.inputFields['person_name'];
  
  const lastName = event.inputFields['person_last_name'];
  
  const referrerId = event.inputFields['referrer_id'];
  
  const referrerName = event.inputFields['referrer_name'];
  
  const referrerLastName = event.inputFields['referrer_last_name'];
  
  const emailSearchParams = {  "filterGroups":[
      {
        "filters":[
          {
            "propertyName": "email",
            "operator": "EQ",
            "value": email
          }
        ]
      }
    ]};
  
  try {
    
    const apiResponse = await hubspotClient.crm.contacts.searchApi.doSearch(emailSearchParams);
    
    if(apiResponse.total === 0){
      const properties = {
  		"email": email,
  		"firstname": firstName,
 		"lastname": lastName,
 		"referrerid": referrerId,
  		"referrer_name": referrerName,
        "referrer_last_name": referrerLastName
		};
      
      const contactProperties = { properties };
      
      const contactResponse = await hubspotClient.crm.contacts.basicApi.create(contactProperties);
      
      console.log("Contact created successfully");
      console.log(contactResponse);
      
    }else{
      const contactId = apiResponse.results[0].id;
      
      const referrerProperties = [
 			"referrerid",
     		"id"
		];
      
      const referrerResponse = await hubspotClient.crm.contacts.basicApi.getById(contactId, referrerProperties);
         
      if(referrerResponse.properties.referrerid !== null && referrerResponse.properties.referrerid !== ''){
        console.log("Contact already has a referrerId attached to it: " + referrerResponse.properties.referrerid)
      }
      else{
        const properties = {
  		"firstname": firstName,
 		"lastname": lastName,
 		"referrerid": referrerId,
  		"referrer_name": referrerName,
        "referrer_last_name": referrerLastName
		};
        
        const contactProperties = { properties };
        
        const updateResponse = await hubspotClient.crm.contacts.basicApi.update(contactId, contactProperties);
        console.log("Contact updated successfully");
        console.log(updateResponse);
      }   
    }

  } catch (err) {
    console.error(err);
    throw err;
  }
}