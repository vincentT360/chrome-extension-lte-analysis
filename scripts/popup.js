function delay(time){
  return new Promise(resolve => {
      setTimeout(resolve, time);
  });
}

async function sendRequest(){
  try{
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await res.json();
    console.log(data);
  } catch(error){
    console.error(`ERROR: ${error}`)
  }
}

sendRequest();
await delay(5000);
sendRequest();