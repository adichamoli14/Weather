const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const userContainer = document.querySelector('.weather-container');
const grantAccessConatiner = document.querySelector('.grant-location-container');
const searchForm = document.querySelector('[data-searchForm]');
const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');
const grantAccessButton = document.querySelector('[data-grantAccess]');
const showError = document.querySelector('[error-container]');

let currentTab = userTab;
const API_KEY = 'da9c2364505e4a329fdf30179101b15f';
currentTab.classList.add('current-tab');
getfromSessionStorage();

//oldTab-> clickedTab           newTab->currentTab

function switchTab(clickedTab){
    if (currentTab != clickedTab){
        currentTab.classList.remove('current-tab'); //background colour htaya grey wala
        currentTab = clickedTab;                    //tab switch
        currentTab.classList.add('current-tab');    //background color add kiya grey wala

        //execution yha aya hai eska mtlb mene koi dusra tab click kiya hai....aur ab meri 2 conditions hngi jo check krengi ki knse tab pe switch krna hai usko visible kra do.
        
        //search form k andr active class nhi hai....toh eska mtlb ab meko esme active class dalni hai
        if(!searchForm.classList.contains('active')){
            userInfoContainer.classList.remove('active');
            grantAccessConatiner.classList.remove('active');
            searchForm.classList.add('active');
        }
        else{
            //phele search waale tab mei tha ab meko user tab mei jana hai
            searchForm.classList.remove('active');
            userInfoContainer.classList.remove('active');
            //abb mei yourWeather wale tab mei aa gya hu toh meko weather show krna pdega jo mere longi and lat k hisaab se aega
            getfromSessionStorage();


        }
    } 
}
//user tab ka event listner
userTab.addEventListener('click', () => {
    //clicked tab as an input param
    switchTab(userTab);
});

//search tab ka event listner
searchTab.addEventListener('click', () => {
    //clicked tab as an input param
    switchTab(searchTab);
});

//checks if coordinates are alreay stored in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem('user-coordinates');
    if(!localCoordinates){
        //agr local coordinates nhi mile
        grantAccessConatiner.classList.add('active');

    }
    else{
        //agr local coordinates mil hai so lati and longi ko leke API ko call kro
        const coordinates = JSON.parse(localCoordinates);       //JSON string ko JSON object mei convert krra hai JSON.parse().
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    //make grant access container invisible
    grantAccessConatiner.classList.remove('active');
    //make loader visible 
    loadingScreen.classList.add('active');

    //API CALL
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        //abb data aa gya hai so loading screen htani hai
        loadingScreen.classList.remove('active');

        //main UI ko dikhana hai jo puri info dikhaega
        userInfoContainer.classList.add('active');

        //function jo data se value nikaal k UI pe render krega
        renderWeatherInfo(data);
    }
    catch(e){
        //baad mei krna hai error 404 add krna hai
        loadingScreen.classList.remove('active');

    }
}

function renderWeatherInfo(data){
    //phele elements fetch krk laane hai taaki enmen dynamically values daal pae

    const cityName = document.querySelector('[data-cityName]');              //city ka naam
    const countryIcon = document.querySelector('[data-countryIcon]');        //country
    const desc = document.querySelector('[data-weatherDesc]');               //desc
    const weatherIcon = document.querySelector('[data-weatherIcon]');        //weather icon
    const temp = document.querySelector('[data-temp]');                      //temp
    const windSpeed = document.querySelector('[data-windSpeed]');            //wind speed
    const humidity = document.querySelector('[data-humidity]');              //humidity
    const cloudiness = document.querySelector('[data-cloudiness]');          //cloud

    //fetch values from data and put it into UI elements
    cityName.innerText = data?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png` ;
    desc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp} °C`;
    windSpeed.innerText = `${data?.wind?.speed} m/s`;
    humidity.innerText = `${data?.main?.humidity}%`;
    cloudiness.innerText = `${data?.clouds?.all}%`;
}

grantAccessButton.addEventListener('click', getlocation);

function getlocation(){
    //geolocation API
    if(navigator.geolocation){      //checks if Geoloc is supported by browser or not
        navigator.geolocation.getCurrentPosition(showPosition);  //This method asynchronously retrieves the device's current position and invokes the showPosition function, passing the retrieved position data as an argument.
    }
    else{
        alert('Geolocation is not supported by this browser.');
        console.log('Geolocation not supported');
    }
}

function showPosition(position){
    //Object containing latitude and longitude
    const  userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    //Storing the object as JSON string in the local storage. To convert the object into JSON string stringify is used
    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
    
    //to display the saved data to the UI
    fetchUserWeatherInfo(userCoordinates);

}

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;

    else    
        fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAccessButton.classList.remove('active');

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }

    catch(e){
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.remove('active');
        console.log("loc not found");
        //error 404 add krnahai
        showError.classList.add('active');


    }
} 
