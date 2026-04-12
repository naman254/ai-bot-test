/**
 * A function to process user data and calculate discounts
 * This code is intentionally written with several issues for the AI to find.
 */

function processUsers(users) {
  var results = []; // Issue: Using 'var' instead of 'const/let'
  
  for (let i = 0; i < users.length; i++) {
    let user = users[i];

    // Issue: Deeply nested logic (Complexity)
    if (user.active) {
      if (user.age > 18) {
        if (user.membership === 'GOLD') {
          // Issue: Hardcoded values and loose equality
          if (user.totalSpend == "1000") { 
            user.discount = 0.1;
          }
        }
      }
    }

    // Issue: Potential 'undefined' error if discount isn't set
    const finalPrice = user.price - (user.price * user.discount);
    
    // Issue: Printing sensitive data in logs
    console.log("Processing user: " + user.email + " with password: " + user.password);
    
    results.push(finalPrice);
  }

  return Results; // Issue: ReferenceError (Results is not defined, should be results)
}

// Issue: Synchronous heavy operation in an async-style environment
const data = processUsers([{active: true, age: 25, membership: 'GOLD', totalSpend: 1000, price: 500}]);
