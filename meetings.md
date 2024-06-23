# Meetings notes

## Meeting 1.
* **DATE:** 2024-02-07
* **ASSISTANTS:** Iván

### Minutes
In our first meeting about the XPNSR project, we talked about important details to start our financial management API. We began with an introduction to XPNSR, explaining its role as an API in a bigger financial system. We discussed why creating this API is important and how it will help manage finances efficiently.

We then discussed the main ideas of the project. We explained key concepts and how they connect within the API, making it easy to understand the interactions between different parts.

We talked about how the API will be used. We described in detail how clients (like user interfaces) and services (like automated systems) will interact with the API. 

Prof. Ivan stressed the importance of keeping good documentation. This documentation should match the GitHub wiki and show the project's progress. He also advised that the project should remain focused on the most important parts and not become too large.



### Action points
*List here the actions points discussed with assistants*
 - Keep a clear and simple project description.   
 -  Clearly define and document key concepts and their connections.    
 - Regularly update the diagram to show current connections. 
 -  Provide detailed descriptions of how clients and services use the API.  
 - Ensure documentation is always up-to-date and matches the GitHub wiki.  
 - Focus the project on essential features only.





## Meeting 2.
* **DATE:**  2024-02-21
* **ASSISTANTS:** Iván

### Minutes
In our second meeting about the XPNSR project, we focused on the database implementation. We discussed the different database tables we will use and explained the columns for each table. We made sure to choose the right types and restrictions for each column. We also talked about the database diagram, which includes all the tables and shows their relationships clearly.

We then looked at the database models. We confirmed that all the models in our implementation match the tables in the project wiki. This means we used the correct column types and set the necessary restrictions. We also made sure that the relationships between tables are set correctly in the models, matching the foreign key relations in the diagram. We specified the `ONDELETE` behavior for each relation and implemented it correctly.

Prof. Ivan pointed out that some important elements are missing from our assessment criteria. Specifically, we need clear documentation of the database models and relationships. He also mentioned that some diagrams are missing. He encouraged us to address these issues and promised to deliver the missing parts by the next meeting.

### Action points
*List here the actions points discussed with assistants*
1.  Ensure all database tables are correctly defined with proper column types and restrictions.
2.  Complete the database diagram with all tables and relationships.
3.  Make sure database models match the design in the project wiki.
4.  Set and implement `ONDELETE` behavior for all relationships.
5.  Update the README file with dependency information and setup instructions.
6.  Provide clear documentation of database models and relationships.
7.  Include all missing diagrams in the documentation.



## Meeting 3.
* **DATE:** 2024-03-25
* **ASSISTANTS:** Mika

### Minutes
In our third meeting about the XPNSR project, we discussed several important aspects related to our API and its documentation. We focused on the Wiki Report, ensuring that our resource table is complete and clearly shows all available URIs and supported methods. We reviewed how addressability is achieved in our API, ensuring a consistent hierarchy of resources, and discussed how each HTTP method is used, providing examples to demonstrate a uniform interface. Additionally, we confirmed our understanding and implementation of statelessness in the API, explaining how server-side state is managed.

We also examined the basic implementation of the project. We noted that our project repository has a good structure and that the code quality is high. The README file in the project root contains full instructions on how to install, deploy the API.

Prof. Ivan emphasized the importance of implementing different API methods and ensuring proper documentation is related to these methods. He also pointed out that we need to include URL converters and schema validation, explaining their absence or usage for each URL variable and incoming request. Caching should be implemented for relevant GET methods with a clear explanation of our caching decisions and cache invalidation. 

### Action points
1.  Complete the resource table in the Wiki Report, showing all URIs and supported methods.
2.  Ensure the API is fully addressable with a consistent hierarchy of resources.
3.  Provide examples to demonstrate a uniform interface for HTTP methods.
4.  Confirm and document the statelessness of the API.
5.  Maintain good project structure and high code quality.
6.  Ensure all necessary documentation is in place and clearly marked.
7.  Update the README file with complete instructions for installation, deployment, and testing.
8.  Implement PUT, DELETE, and other API methods with proper documentation.
9.  Include and justify the use of URL converters and schema validation.
10.  Implement caching for relevant GET methods and explain caching decisions.
11.  Apply authentication to at least one resource and justify its use for each resource and method.



## Meeting 4.
* **DATE:** 2024-04-11
* **ASSISTANTS:** Prof. Iván

### Minutes
During our meeting, we discussed about hypermedia design, and its implementation. We talked about the feedback we received last time on our documentation. We showed our work of how the system responds to different requests, especially when there are errors (like when something isn’t found), need to be clearer and match exactly what happens in the system.

The way we’ve planned out the links between different parts of the project were also discussed. Right now, our diagram that shows these links wasn't finished, and some of the connections we planned aren’t clear. We also need to explain why we’re making some links ourselves instead of using standard ones that are already known.

When we looked at how we’ve built the system so far, there are some places where the system doesn’t work like it’s supposed to. For example, if someone tries to update something without saying how much money is involved, the system should say that’s not okay with a 400 error. Instead, it gives a 500 error right now.


### Action points
- Organize the documentation so it's easier to use and understand.
- Making sure all examples of how the system responds are clear and match what really happens.
- Finish the diagram that shows how everything in the system connects.
- Explain clearly why we've chosen to make links the way we have.
- Fix the part of the system that gives the wrong error message when someone tries to update something without saying how much money is involved.
- Test the API more to make sure it works in all the ways we've said it should.



## Midterm meeting - Not Done Yet
* **DATE:**
* **ASSISTANTS:**

### Minutes
*Summary of what was discussed during the meeting*

### Action points
*List here the actions points discussed with assistants*




## Final meeting
* **DATE:** 2024-05-27 
* **ASSISTANTS:** Iván

### Minutes
During our final meeting, we presented the client description, implementation, hypermedia use, and the auxiliary service. For the **client description**, our overview was too vague. We need to give more details about what the client does and which API methods it uses. The use case diagram, GUI layout, and screen workflow were good and clear.

In **client implementation**, our instructions, code documentation, quality, and demonstration were strong. However, we need to handle errors better so that wrong inputs are managed properly. The visual design of the client needs improvement to make it more user-friendly. We also need to add more features and complexity. 

We did not implemented the **use of hypermedia**  We need to use link relation names to navigate the API and create forms dynamically based on provided schemas.

### Action points
- Give a detailed overview of the client, specifying the resources and methods it accesses.
- Handle errors better to manage invalid inputs.
- Improve the visual design of the client for better user experience.
- Add more features and complexity to the client.
- Implementing Hypermedia
- Clearly justify the chosen architecture in the documentation of Auxiliary Service.


## Extended Final meeting
* **DATE:** 2024-06-25 
* **ASSISTANTS:** Iván

### Minutes
In this meeting, we will provide updated XPNSR app backend api, hypermedia, frontend client, documentation and auxilary service.


### Changes:

#### Deliverable 3.0
| Task | Update |
| --- | --- |
| Resource Table | Updated in the documentation |
| Addressability | Updated in the documentation |
| Uniform Interface | Updated in the documentation |
| Statelesness | Updated in the documentation |
| Code Quality | Two new tools PMD and CheckStyle have been introduced |
| Documentation | Added proper JSDoc documentation to all files |
| Test Coverage | Added unit tests for all API endpoints |
| URL Converters | Added URL converter in report API |

#### Deliverable 4.0
| Task | Update |
| --- | --- |
| State diagram | Updated the diagram |
| Connectedness | Improved connectedness |
| Response examples | - Missing links fixed, 4xx issues fixed<br>- Documentation updated and made consistent |
| Documentation structure | No components or parts of code that are reused |
| Control implementation | Control is implemented in all API endpoints |
| Testing coverage | Hypermedia links tests are covered in unit tests |
| Custom link relations | - Custom link relations, IANA is described in the documentation<br>- Missing relations are added |
| Implementation works | PUT transactions returning 500s are fixed |

#### Deliverable 5.0
| Task | Update |
| --- | --- |
| Overview | Improved |
| Error Handling | Detailed error handling is added in API and client-side |
| Visuals | Visuals are improved |
| Complexity/Features | - More complexities are added<br>- Pagination<br>- Navigation |
| Uses Schemas | N/A |
| Uses Link Relations | - Client uses Hypermedia links from API to add, update, and delete entities |
| Overview | Poor description for Aux Service |
| API implementation | - Very simple API implementation<br>- Not error controlled |
| Code Quality | Added missing code quality chekcing for auxilary service |





