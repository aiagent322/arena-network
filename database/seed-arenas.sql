-- ============================================================
-- ARENA NETWORK — League Arena Database
-- 124 Agricultural & Equine Centers
-- ============================================================
-- Run after schema.sql: psql -d arena_network -f seed-arenas.sql
-- ============================================================

-- Clear existing arena seed data
DELETE FROM events;
DELETE FROM vendors;
DELETE FROM sponsors;
DELETE FROM news;
DELETE FROM arenas;

INSERT INTO arenas (name, slug, city, state, address, website, arena_type, indoor_arenas, outdoor_arenas, stall_count, rv_spaces, seating_capacity, is_verified, is_active) VALUES

-- ═══════════════════════════════════════════
-- ARIZONA (8)
-- ═══════════════════════════════════════════
('WestWorld of Scottsdale','westworld-scottsdale','Scottsdale','AZ','16601 N Pima Rd, Scottsdale, AZ 85260','https://www.scottsdaleaz.gov/westworld','equine',4,6,2200,800,8000,TRUE,TRUE),
('Horseshoe Park & Equestrian Centre','horseshoe-park','Queen Creek','AZ','20464 E Riggs Rd, Queen Creek, AZ 85142','https://www.horseshoepark.com','equine',2,3,500,250,3000,TRUE,TRUE),
('Buckeye Equestrian Center','buckeye-equestrian','Buckeye','AZ','799 N Miller Rd, Buckeye, AZ 85326',NULL,'equine',1,3,400,200,2500,TRUE,TRUE),
('Rancho Rio Arena','rancho-rio','Wickenburg','AZ','37505 S Rancho Rio Dr, Wickenburg, AZ 85390',NULL,'equine',1,2,300,150,1500,TRUE,TRUE),
('Pima County Fairgrounds','pima-county-fairgrounds','Tucson','AZ','11300 S Houghton Rd, Tucson, AZ 85747','https://www.pimafair.com','fairgrounds',2,3,400,300,5000,TRUE,TRUE),
('Tim''s Toyota Center','tims-toyota-center','Prescott Valley','AZ','3201 N Main St, Prescott Valley, AZ 86314','https://www.timstoyotacenter.com','multi-use',1,1,100,100,6200,TRUE,TRUE),
('Arizona State Fairgrounds','arizona-state-fairgrounds','Phoenix','AZ','1826 W McDowell Rd, Phoenix, AZ 85007','https://azstatefair.com','fairgrounds',3,4,800,400,8000,TRUE,TRUE),
('Santa Cruz County Fairgrounds','santa-cruz-county-fair-az','Sonoita','AZ','3142 S Highway 83, Sonoita, AZ 85637','https://www.sonoitafairgrounds.com','fairgrounds',0,2,200,150,3000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- TEXAS (16)
-- ═══════════════════════════════════════════
('Will Rogers Memorial Center','will-rogers','Fort Worth','TX','3401 W Lancaster Ave, Fort Worth, TX 76107','https://www.fortworthtexas.gov/departments/public-events/will-rogers','multi-use',5,3,3000,600,10000,TRUE,TRUE),
('Bell County Expo Center','bell-county-expo','Belton','TX','301 W Loop 121, Belton, TX 76513','https://www.bellcountyexpo.com','agricultural',3,2,800,400,6500,TRUE,TRUE),
('Fort Worth Stockyards','fort-worth-stockyards','Fort Worth','TX','131 E Exchange Ave, Fort Worth, TX 76164','https://www.fortworthstockyards.org','rodeo',1,1,200,100,4000,TRUE,TRUE),
('NRG Center & NRG Arena','nrg-center-houston','Houston','TX','1 NRG Park, Houston, TX 77054','https://www.nrgpark.com','multi-use',2,2,2500,500,70000,TRUE,TRUE),
('Amarillo National Center','amarillo-national-center','Amarillo','TX','3301 SE 10th Ave, Amarillo, TX 79104','https://www.tristatefairgrounds.com','multi-use',2,2,600,300,5000,TRUE,TRUE),
('Taylor County Expo Center','taylor-county-expo','Abilene','TX','1700 TX-36, Abilene, TX 79602','https://www.taylorcountyexpocenter.com','agricultural',2,2,500,250,5500,TRUE,TRUE),
('Mesquite Arena','mesquite-arena','Mesquite','TX','1818 Rodeo Dr, Mesquite, TX 75149','https://www.mesquitearena.com','rodeo',1,1,200,100,5500,TRUE,TRUE),
('Horseshoe Arena','horseshoe-arena-midland','Midland','TX','2514 Arena Trail, Midland, TX 79701','https://www.horseshoearena.com','equine',1,1,300,200,5000,TRUE,TRUE),
('Great Southwest Equestrian Center','great-southwest-equestrian','Katy','TX','2501 S Mason Rd, Katy, TX 77450','https://www.gswec.com','equine',2,3,800,200,3000,TRUE,TRUE),
('Texas Rose Horse Park','texas-rose-horse-park','Tyler','TX','14078 State Hwy 110 N, Tyler, TX 75704','https://www.texasrosehorsepark.com','equine',1,3,350,200,2000,TRUE,TRUE),
('Star of Texas Fair & Rodeo','star-of-texas','Austin','TX','9100 Decker Lake Rd, Austin, TX 78724','https://www.rodeoaustin.com','rodeo',1,2,400,300,7500,TRUE,TRUE),
('Extraco Events Center','extraco-events-center','Waco','TX','4601 Bosque Blvd, Waco, TX 76710','https://www.extracoeventscenter.com','multi-use',2,2,600,300,6200,TRUE,TRUE),
('Circle T Arena','circle-t-arena','Hamilton','TX','4007 W Hwy 36, Hamilton, TX 76531','https://www.circletarena.com','equine',1,2,300,100,2000,TRUE,TRUE),
('Hopkins County Civic Center','hopkins-county-civic','Sulphur Springs','TX','1200 Houston St, Sulphur Springs, TX 75482','https://www.hopkinscountytx.org','multi-use',1,1,250,150,3500,TRUE,TRUE),
('Mallet Event Center','mallet-event-center','Levelland','TX','2312 US-385, Levelland, TX 79336',NULL,'multi-use',1,1,200,100,2000,TRUE,TRUE),
('South Plains Fairgrounds','south-plains-fairgrounds','Lubbock','TX','105 E Broadway, Lubbock, TX 79403','https://www.southplainsfair.com','fairgrounds',2,2,500,300,5000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- OKLAHOMA (10)
-- ═══════════════════════════════════════════
('Lazy E Arena','lazy-e','Guthrie','OK','7201 E Hwy 66, Guthrie, OK 73044','https://www.lazye.com','equine',1,2,600,350,5800,TRUE,TRUE),
('Oklahoma State Fair Park','okc-state-fair','Oklahoma City','OK','3001 General Pershing Blvd, Oklahoma City, OK 73107','https://okstatefair.com','agricultural',3,4,2000,700,12000,TRUE,TRUE),
('Tulsa Expo Square','tulsa-expo','Tulsa','OK','4145 E 21st St, Tulsa, OK 74114','https://www.exposquare.com','multi-use',4,3,1800,500,9200,TRUE,TRUE),
('Great Plains Coliseum','great-plains-coliseum','Lawton','OK','920 SW Sheridan Rd, Lawton, OK 73505',NULL,'multi-use',1,1,250,100,2500,TRUE,TRUE),
('Hardy Murphy Coliseum','hardy-murphy-coliseum','Ardmore','OK','3200 W Broadway St, Ardmore, OK 73401',NULL,'equine',1,1,400,200,3000,TRUE,TRUE),
('Jim Norick Arena','jim-norick-arena','Oklahoma City','OK','3001 General Pershing Blvd, Oklahoma City, OK 73107','https://okstatefair.com','equine',1,1,500,200,8800,TRUE,TRUE),
('Stephens County Expo Center','stephens-county-expo','Duncan','OK','2002 S 13th St, Duncan, OK 73533',NULL,'agricultural',1,1,200,100,2000,TRUE,TRUE),
('Claremore Expo Center','claremore-expo','Claremore','OK','400 S Veterans Pkwy, Claremore, OK 74017','https://www.claremoreexpo.com','multi-use',1,2,300,150,3000,TRUE,TRUE),
('Kay County Fairgrounds','kay-county-fairgrounds','Blackwell','OK','600 N Main St, Blackwell, OK 74631',NULL,'fairgrounds',1,2,200,100,2500,TRUE,TRUE),
('Creek County Fairgrounds','creek-county-fairgrounds','Kellyville','OK','17806 W Hwy 66, Kellyville, OK 74039',NULL,'fairgrounds',0,2,150,100,2000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- NEVADA (4)
-- ═══════════════════════════════════════════
('South Point Arena & Equestrian Center','south-point','Las Vegas','NV','9777 Las Vegas Blvd S, Las Vegas, NV 89183','https://www.southpointcasino.com/amenities/equestrian-center','multi-use',2,1,1200,500,4600,TRUE,TRUE),
('Reno-Sparks Livestock Events Center','reno-sparks-livestock','Reno','NV','1350 N Wells Ave, Reno, NV 89512','https://www.renolivestock.com','multi-use',2,2,800,400,5500,TRUE,TRUE),
('Winnemucca Events Complex','winnemucca-events','Winnemucca','NV','3825 Potato Rd, Winnemucca, NV 89445','https://www.winnemuccaevents.com','multi-use',1,2,300,200,3000,TRUE,TRUE),
('Churchill County Fairgrounds','churchill-county-fair','Fallon','NV','325 Sheckler Rd, Fallon, NV 89406','https://www.churchillcountyfair.com','fairgrounds',1,2,200,150,2500,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- CALIFORNIA (8)
-- ═══════════════════════════════════════════
('Del Mar Fairgrounds','del-mar-fairgrounds','Del Mar','CA','2260 Jimmy Durante Blvd, Del Mar, CA 92014','https://www.delmarfairgrounds.com','fairgrounds',2,4,1000,300,5000,TRUE,TRUE),
('Paso Robles Horse Park','paso-robles-horse-park','Paso Robles','CA','3801 Hughes Pkwy, Paso Robles, CA 93446','https://www.pasorobleshorsepark.com','equine',1,4,600,200,2000,TRUE,TRUE),
('Los Angeles Equestrian Center','la-equestrian-center','Burbank','CA','480 Riverside Dr, Burbank, CA 91506','https://www.la-equestriancenter.com','equine',2,4,500,100,1500,TRUE,TRUE),
('Brookside Equestrian Park','brookside-equestrian','Elk Grove','CA','11120 Bradley Ranch Rd, Elk Grove, CA 95624','https://www.brooksideequestrianpark.com','equine',1,3,400,150,1500,TRUE,TRUE),
('Salinas Sports Complex','salinas-sports-complex','Salinas','CA','1034 N Main St, Salinas, CA 93906','https://www.salinassportscomplex.com','multi-use',1,2,300,200,3000,TRUE,TRUE),
('Santa Barbara Earl Warren Showgrounds','earl-warren-showgrounds','Santa Barbara','CA','3400 Calle Real, Santa Barbara, CA 93105','https://www.earlwarren.com','fairgrounds',1,3,300,150,3000,TRUE,TRUE),
('Cal Expo','cal-expo','Sacramento','CA','1600 Exposition Blvd, Sacramento, CA 95815','https://www.calexpo.com','fairgrounds',2,3,800,400,8000,TRUE,TRUE),
('Yucaipa Equestrian Center','yucaipa-equestrian','Yucaipa','CA','13273 California St, Yucaipa, CA 92399',NULL,'equine',1,2,200,100,1000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- COLORADO (6)
-- ═══════════════════════════════════════════
('National Western Complex','national-western-complex','Denver','CO','4655 Humboldt St, Denver, CO 80216','https://www.nationalwestern.com','multi-use',3,2,1500,400,10000,TRUE,TRUE),
('Colorado State Fair','colorado-state-fair','Pueblo','CO','1001 Beulah Ave, Pueblo, CO 81004','https://www.coloradostatefair.com','fairgrounds',2,3,800,400,6000,TRUE,TRUE),
('Douglas County Fairgrounds','douglas-county-fair','Castle Rock','CO','500 Fairgrounds Rd, Castle Rock, CO 80104','https://www.douglascountyfairgrounds.com','fairgrounds',1,2,300,200,3000,TRUE,TRUE),
('Colorado Horse Park','colorado-horse-park','Parker','CO','7522 S Pinery Dr, Parker, CO 80134','https://www.coloradohorsepark.com','equine',2,4,700,200,3000,TRUE,TRUE),
('Mesa County Fairgrounds','mesa-county-fair','Grand Junction','CO','2785 US-50, Grand Junction, CO 81503','https://www.mesacountyfair.com','fairgrounds',1,2,400,200,4000,TRUE,TRUE),
('Eagle County Fairgrounds','eagle-county-fair','Eagle','CO','550 Broadway St, Eagle, CO 81631','https://www.eaglecounty.us','fairgrounds',1,2,200,100,2000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- WYOMING (4)
-- ═══════════════════════════════════════════
('Cheyenne Frontier Days','cheyenne-frontier-days','Cheyenne','WY','4610 Carey Ave, Cheyenne, WY 82001','https://www.cfdrodeo.com','rodeo',2,3,1000,500,19000,TRUE,TRUE),
('Casper Events Center','casper-events-center','Casper','WY','1 Events Dr, Casper, WY 82601','https://www.casperevents.com','multi-use',1,1,300,200,8000,TRUE,TRUE),
('Cam-Plex','cam-plex','Gillette','WY','1635 Reata Dr, Gillette, WY 82718','https://www.cam-plex.com','multi-use',2,2,400,300,5000,TRUE,TRUE),
('Park County Fairgrounds','park-county-fair-wy','Powell','WY','655 E 5th St, Powell, WY 82435','https://www.parkcountyfair.com','fairgrounds',1,2,300,150,3000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- MONTANA (3)
-- ═══════════════════════════════════════════
('MetraPark','metrapark','Billings','MT','308 6th Ave N, Billings, MT 59101','https://www.metrapark.com','multi-use',2,2,600,300,10000,TRUE,TRUE),
('Montana ExpoPark','montana-expopark','Great Falls','MT','400 3rd St NW, Great Falls, MT 59404','https://www.montanaexpopark.com','fairgrounds',2,2,500,250,6000,TRUE,TRUE),
('Warfield Equestrian Park','warfield-equestrian','Billings','MT','3651 Alkali Creek Rd, Billings, MT 59105',NULL,'equine',1,3,400,200,2000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- SOUTH DAKOTA / NORTH DAKOTA (4)
-- ═══════════════════════════════════════════
('Central States Fairgrounds','central-states-fair','Rapid City','SD','800 San Francisco St, Rapid City, SD 57701','https://www.centralstatesfair.com','fairgrounds',2,2,450,250,6000,TRUE,TRUE),
('W.H. Lyon Fairgrounds','wh-lyon-fairgrounds','Sioux Falls','SD','100 N Lyon Blvd, Sioux Falls, SD 57107','https://www.siouxempirefair.com','fairgrounds',2,2,400,200,4000,TRUE,TRUE),
('Red River Valley Fairgrounds','red-river-valley-fair','Fargo','ND','1805 Main Ave W, Fargo, ND 58078','https://www.redrivervalleyfair.com','fairgrounds',2,2,400,200,5000,TRUE,TRUE),
('North Dakota State Fair','nd-state-fair','Minot','ND','2005 Burdick Expy E, Minot, ND 58701','https://www.ndstatefair.com','fairgrounds',2,3,500,300,6000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- NEBRASKA / KANSAS (5)
-- ═══════════════════════════════════════════
('Lancaster Event Center','lancaster-event-center','Lincoln','NE','4100 N 84th St, Lincoln, NE 68507','https://www.lancastereventcenter.org','multi-use',3,2,800,300,5000,TRUE,TRUE),
('Fonner Park','fonner-park','Grand Island','NE','700 E Stolley Park Rd, Grand Island, NE 68801','https://www.fonnerpark.com','multi-use',2,2,500,250,5000,TRUE,TRUE),
('Kansas State Fairgrounds','kansas-state-fair','Hutchinson','KS','2000 N Poplar St, Hutchinson, KS 67502','https://www.kansasstatefair.com','fairgrounds',2,3,600,300,6000,TRUE,TRUE),
('Kansas Expocentre','kansas-expocentre','Topeka','KS','1 Expocentre Dr, Topeka, KS 66612','https://www.ksexpo.com','multi-use',2,1,400,200,8000,TRUE,TRUE),
('Wichita Coliseum','wichita-coliseum','Wichita','KS','1229 E 85th St N, Valley Center, KS 67147',NULL,'multi-use',1,2,300,200,3000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- NEW MEXICO (3)
-- ═══════════════════════════════════════════
('Expo New Mexico','expo-new-mexico','Albuquerque','NM','300 San Pedro Dr NE, Albuquerque, NM 87108','https://www.exponm.com','fairgrounds',3,3,800,400,7000,TRUE,TRUE),
('Curry County Events Center','curry-county-events','Clovis','NM','700 Main St, Clovis, NM 88101','https://www.currycountyevents.com','multi-use',1,1,300,200,3000,TRUE,TRUE),
('San Juan County Fairgrounds','san-juan-county-fair','Farmington','NM','901 Fairgrounds Rd, Farmington, NM 87401',NULL,'fairgrounds',1,2,250,150,3000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- UTAH (4)
-- ═══════════════════════════════════════════
('Salt Lake County Equestrian Park','slc-equestrian-park','South Jordan','UT','2100 W 11400 S, South Jordan, UT 84095','https://www.slco.org/equestrian','equine',1,3,500,200,3000,TRUE,TRUE),
('Pegasus Event Center','pegasus-event-center','Grantsville','UT','291 Race St, Grantsville, UT 84029',NULL,'equine',1,2,300,150,2000,TRUE,TRUE),
('Cross Hollow Event Center','cross-hollow-event','Cedar City','UT','11 N Cross Hollow Dr, Cedar City, UT 84720',NULL,'multi-use',1,2,200,150,2500,TRUE,TRUE),
('Days of 47 Arena','days-of-47-arena','Salt Lake City','UT','155 N 1000 W, Salt Lake City, UT 84116',NULL,'rodeo',1,1,200,100,5000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- KENTUCKY / TENNESSEE (5)
-- ═══════════════════════════════════════════
('Kentucky Horse Park','kentucky-horse-park','Lexington','KY','4089 Iron Works Pkwy, Lexington, KY 40511','https://www.kyhorsepark.com','equine',3,5,1200,400,7000,TRUE,TRUE),
('Louisville Equestrian Center','louisville-equestrian','Louisville','KY','4400 Billtown Rd, Louisville, KY 40299',NULL,'equine',2,2,200,50,1000,TRUE,TRUE),
('Kentucky Exposition Center','ky-exposition-center','Louisville','KY','937 Phillips Ln, Louisville, KY 40209','https://www.kyvenues.com','multi-use',3,2,1500,400,12000,TRUE,TRUE),
('Williamson County Ag Expo Park','williamson-county-expo','Franklin','TN','4215 Long Ln, Franklin, TN 37064','https://www.wcparksandrec.com','agricultural',2,3,400,200,3000,TRUE,TRUE),
('Tennessee Miller Coliseum','tn-miller-coliseum','Murfreesboro','TN','715 Champion Way, Murfreesboro, TN 37132',NULL,'equine',1,2,600,200,4000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- NORTH CAROLINA / SOUTH CAROLINA (5)
-- ═══════════════════════════════════════════
('Tryon International Equestrian Center','tryon-equestrian','Mill Spring','NC','4066 Pea Ridge Rd, Mill Spring, NC 28756','https://www.tryon.com','equine',3,6,1000,500,6000,TRUE,TRUE),
('Gov. Hunt Horse Complex','hunt-horse-complex','Raleigh','NC','1025 Blue Ridge Blvd, Raleigh, NC 27607','https://www.ncstatefair.org','equine',2,4,700,300,4000,TRUE,TRUE),
('WNC Agricultural Center','wnc-ag-center','Fletcher','NC','761 Boylston Hwy, Fletcher, NC 28732','https://www.wncagcenter.org','agricultural',2,3,500,200,3000,TRUE,TRUE),
('T. Ed Garrison Livestock Arena','garrison-livestock','Pendleton','SC','1101 W Queen St, Pendleton, SC 29670','https://www.clemson.edu/public/garrison','agricultural',1,2,300,150,3000,TRUE,TRUE),
('Aiken Horse Park','aiken-horse-park','Aiken','SC','930 Powderhouse Rd, Aiken, SC 29803','https://www.aikentriplecrownfoundation.org','equine',0,6,624,200,3000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- GEORGIA / ALABAMA (4)
-- ═══════════════════════════════════════════
('Georgia International Horse Park','georgia-horse-park','Conyers','GA','1996 Centennial Olympic Pkwy, Conyers, GA 30013','https://www.georgiahorsepark.com','equine',2,4,600,300,4000,TRUE,TRUE),
('Georgia National Fairgrounds','georgia-national-fair','Perry','GA','401 Larry Walker Pkwy, Perry, GA 31069','https://www.gnfa.com','fairgrounds',3,4,1200,500,8000,TRUE,TRUE),
('Full Circle Horse Park','full-circle-horse-park','Pell City','AL','5555 Wolf Creek Rd, Pell City, AL 35128',NULL,'equine',1,3,400,200,2500,TRUE,TRUE),
('Celebration Rodeo Arena','celebration-arena','Decatur','AL','1000 Point Mallard Dr, Decatur, AL 35601',NULL,'rodeo',1,1,200,100,5000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- FLORIDA (6)
-- ═══════════════════════════════════════════
('Bob Thomas Equestrian Center','bob-thomas-equestrian','Tampa','FL','4800 US-301, Tampa, FL 33610','https://floridastatefair.com/equestrian','equine',1,5,471,200,3000,TRUE,TRUE),
('Florida Horse Park','florida-horse-park','Ocala','FL','11008 S Highway 475, Ocala, FL 34480','https://www.flhorsepark.com','equine',1,4,500,300,3000,TRUE,TRUE),
('Jacksonville Equestrian Center','jacksonville-equestrian','Jacksonville','FL','13611 Normandy Blvd, Jacksonville, FL 32221','https://www.jaxequestriancenter.com','equine',2,3,400,200,2500,TRUE,TRUE),
('Escambia County Equestrian Center','escambia-equestrian','Pensacola','FL','7751 Mobile Hwy, Pensacola, FL 32526',NULL,'equine',1,2,200,100,1500,TRUE,TRUE),
('Palm Beach International Equestrian Center','pbiec','Wellington','FL','3400 Equestrian Club Dr, Wellington, FL 33414','https://www.pbiec.com','equine',2,12,2500,400,5000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- LOUISIANA / MISSISSIPPI / ARKANSAS (5)
-- ═══════════════════════════════════════════
('Ike Hamilton Expo Center','ike-hamilton-expo','West Monroe','LA','501 Mane St, West Monroe, LA 71292','https://www.ikehamiltonexpo.com','multi-use',1,1,400,200,2900,TRUE,TRUE),
('Farr Park Equestrian Center','farr-park-equestrian','Baton Rouge','LA','6402 River Rd, Baton Rouge, LA 70820',NULL,'equine',1,2,200,100,1500,TRUE,TRUE),
('Kirk Fordice Equine Center','kirk-fordice-equine','Jackson','MS','1207 Mississippi St, Jackson, MS 39202','https://fairgrounds.mdac.ms.gov','equine',1,2,600,300,6500,TRUE,TRUE),
('Arkansas State Fairgrounds','arkansas-state-fair','Little Rock','AR','2600 Howard St, Little Rock, AR 72206','https://www.arkansasstatefair.com','fairgrounds',2,2,500,300,6000,TRUE,TRUE),
('Kay Rodgers Park','kay-rodgers-park','Fort Smith','AR','4400 Midland Blvd, Fort Smith, AR 72904','https://www.kayrodgerspark.com','multi-use',2,2,400,200,4000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- OREGON / WASHINGTON / IDAHO (6)
-- ═══════════════════════════════════════════
('Oregon Horse Center','oregon-horse-center','Eugene','OR','90751 Prairie Rd, Eugene, OR 97402','https://www.oregonhorsecenter.com','equine',2,3,500,200,2000,TRUE,TRUE),
('DevonWood Equestrian Centre','devonwood-equestrian','Sherwood','OR','25033 SW Pacific Hwy, Sherwood, OR 97140','https://www.devonwood.com','equine',1,3,300,100,1500,TRUE,TRUE),
('Josephine County Fairgrounds','josephine-county-fair','Grants Pass','OR','1451 Fairgrounds Rd, Grants Pass, OR 97527','https://attheexpo.com','fairgrounds',1,2,200,150,3000,TRUE,TRUE),
('Evergreen State Fairgrounds','evergreen-state-fair','Monroe','WA','14405 179th Ave SE, Monroe, WA 98272','https://www.evergreenfair.org','fairgrounds',1,3,402,200,2700,TRUE,TRUE),
('Washington State Fair Events Center','wa-state-fair','Puyallup','WA','110 9th Ave SW, Puyallup, WA 98371','https://www.thefair.com','fairgrounds',2,3,600,300,6000,TRUE,TRUE),
('Idaho Horse Park','idaho-horse-park','Nampa','ID','16422 Can-Ada Rd, Nampa, ID 83687','https://www.idahohorsepark.com','equine',1,3,400,200,3000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- VIRGINIA / MARYLAND / PENNSYLVANIA (5)
-- ═══════════════════════════════════════════
('Virginia Horse Center','virginia-horse-center','Lexington','VA','487 Maury River Rd, Lexington, VA 24450','https://www.horsecenter.org','equine',2,4,700,300,4000,TRUE,TRUE),
('Prince George''s Equestrian Center','pg-equestrian','Upper Marlboro','MD','14900 Pennsylvania Ave, Upper Marlboro, MD 20772','https://www.pgparks.com','equine',1,3,250,100,3000,TRUE,TRUE),
('Devon Horse Show Grounds','devon-horse-show','Devon','PA','23 Dorset Rd, Devon, PA 19333','https://www.devonhorseshow.net','equine',0,3,300,100,3000,TRUE,TRUE),
('New Jersey Equestrian Center','nj-equestrian','Pompton Plains','NJ','21 Old Jackson Ave, Pompton Plains, NJ 07444',NULL,'equine',1,2,200,50,1000,TRUE,TRUE),
('HITS-on-the-Hudson','hits-hudson','Saugerties','NY','454 Washington Ave Ext, Saugerties, NY 12477','https://www.hitsshows.com','equine',2,8,800,300,3000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- OHIO / INDIANA / MICHIGAN (5)
-- ═══════════════════════════════════════════
('Ohio Expo Center & State Fairgrounds','ohio-expo-center','Columbus','OH','717 E 17th Ave, Columbus, OH 43211','https://www.ohiostatefair.com','fairgrounds',3,4,1500,400,10000,TRUE,TRUE),
('Roberts Arena','roberts-arena','Wilmington','OH','6000 SR 380, Wilmington, OH 45177','https://www.robertsarena.com','equine',2,2,500,200,3000,TRUE,TRUE),
('Indiana State Fairgrounds','indiana-state-fair','Indianapolis','IN','1202 E 38th St, Indianapolis, IN 46205','https://www.indianastatefair.com','fairgrounds',3,3,1200,400,8000,TRUE,TRUE),
('Allen County War Memorial Coliseum','allen-county-coliseum','Fort Wayne','IN','4000 Parnell Ave, Fort Wayne, IN 46805','https://www.memorialcoliseum.com','multi-use',1,1,400,200,8000,TRUE,TRUE),
('MSU Pavilion','msu-pavilion','East Lansing','MI','4301 Farm Ln, East Lansing, MI 48824','https://www.canr.msu.edu','equine',1,1,300,100,2000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- ILLINOIS / IOWA / MISSOURI / WISCONSIN (7)
-- ═══════════════════════════════════════════
('Illinois State Fairgrounds','illinois-state-fair','Springfield','IL','801 E Sangamon Ave, Springfield, IL 62794','https://www.statefair.illinois.gov','fairgrounds',3,3,900,400,7000,TRUE,TRUE),
('DuQuoin State Fairgrounds','duquoin-state-fair','Du Quoin','IL','655 Executive Dr, Du Quoin, IL 62832','https://www.duquoinstatefair.net','fairgrounds',2,2,500,300,5000,TRUE,TRUE),
('Iowa State Fairgrounds','iowa-state-fair','Des Moines','IA','3000 E Grand Ave, Des Moines, IA 50317','https://www.iowastatefair.org','fairgrounds',3,3,1000,400,10000,TRUE,TRUE),
('American Royal Complex','american-royal','Kansas City','MO','1701 American Royal Ct, Kansas City, MO 64102','https://www.americanroyal.com','multi-use',2,2,800,300,6000,TRUE,TRUE),
('Missouri State Fairgrounds','missouri-state-fair','Sedalia','MO','2503 W 16th St, Sedalia, MO 65301','https://www.mostatefair.com','fairgrounds',3,3,800,400,6000,TRUE,TRUE),
('Ozark Empire Fairgrounds','ozark-empire-fair','Springfield','MO','3001 N Grant Ave, Springfield, MO 65803','https://www.ozarkempirefair.com','fairgrounds',2,2,500,250,5000,TRUE,TRUE),
('Alliant Energy Center','alliant-energy-center','Madison','WI','1919 Alliant Energy Center Way, Madison, WI 53713','https://www.alliantenergycenter.com','multi-use',2,2,600,300,8000,TRUE,TRUE),

-- ═══════════════════════════════════════════
-- MINNESOTA / DAKOTAS ADDITIONS (3)
-- ═══════════════════════════════════════════
('Minnesota State Fairgrounds','mn-state-fair','Saint Paul','MN','1265 Snelling Ave N, Saint Paul, MN 55108','https://www.mnstatefair.org','fairgrounds',3,3,800,400,10000,TRUE,TRUE),
('Canterbury Park','canterbury-park','Shakopee','MN','1100 Canterbury Rd S, Shakopee, MN 55379','https://www.canterburypark.com','equine',1,2,400,200,4000,TRUE,TRUE)

;

-- ═══════════════════════════════════════════
-- VERIFY COUNT
-- ═══════════════════════════════════════════
DO $$
DECLARE cnt INTEGER;
BEGIN
    SELECT COUNT(*) INTO cnt FROM arenas WHERE is_active = TRUE;
    RAISE NOTICE 'Arena count: % arenas loaded', cnt;
END $$;
