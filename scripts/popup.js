function delay(time){
  return new Promise(resolve => {
      setTimeout(resolve, time);
  });
}

async function sendSingleRequest(){
  try{
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await res.json();
    console.log(data);
  } catch(error){
    console.error(`ERROR: ${error}`)
  }
}

async function sendRequest(){
  await sendSingleRequest();
  //const start = new Date(); // Used to debug time elapsed
  await delay(5000);
  //const end = new Date();
  //console.log(start - end)
  await sendSingleRequest();
}

//Note: We have to do getElementById b/c chrome does not allow inline scripting like onclick=myfunction() in HTML
//Basically, all scripting needs to stay in the js file
document.getElementById("sendRequest").addEventListener("click", sendRequest);