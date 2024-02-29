/* global describe:false */
import { chai } from '@environment-safe/chai';
import { it } from '@open-automaton/moka';
import { hash, Card } from '../src/index.mjs';
import { File, Path } from '@environment-safe/file';
const should = chai.should();
// may need to change based on what's @ the top of image search
const vesuvanHashes = [
    '8ec144af9002f2342741fe126634860c83c25811d12532015d4be48bd1c2c89d',
    '56a23ee46e31f6ad7a4f0ebbbb303a7985b0a7346d5afddc7de9f535279d6e07',
    '8ddb520521c7dd91d973af27691d9b9649dbca586b1bd1baaac0457787afe0db'
];
describe('ccg-cli', ()=>{
    describe('performs a simple test suite', ()=>{
        it('can search for an image', async function(){
            this.timeout(5000);
            const card = new Card();
            const image = await card.imageSearch({
                name: 'Vesuvan Doppelganger'
            });
            image.file.path = './test/cache/test.jpg';
            const hashValue = await hash('SHA-256', image.file.buffer);
            vesuvanHashes.indexOf(hashValue).should.not.equal(-1);
            //hashValue.should.equal(vesuvan);
            await image.file.save();
            const savedFile = new File('./test/cache/test.jpg');
            await savedFile.load();
            const savedHashValue = await hash('SHA-256', savedFile.buffer);
            savedHashValue.should.equal(hashValue);
            await savedFile.delete();
        });
        
        it('can fetch data for a card', async function(){
            this.timeout(5000);
            const card = new Card();
            const data = await card.data({
                name: 'Vesuvan Doppelganger'
            });
            data.object.should.equal('card');
            data.name.should.equal('Vesuvan Doppelganger');
            data.artist.should.equal('Quinton Hoover');
            data.id.should.equal('543c08bc-f8ce-4324-b78d-891c49f3a24a');
        });
        
        it('can fetch cached data for a card', async function(){
            this.timeout(5000);
            const card = new Card({
                name: 'Vesuvan Doppelganger'
            });
            const data = await card.localData();
            data.object.should.equal('card');
            data.name.should.equal('Vesuvan Doppelganger');
            data.artist.should.equal('Quinton Hoover');
            data.id.should.equal('543c08bc-f8ce-4324-b78d-891c49f3a24a');
        });
        
        //*
        it('can fetch cached image for a card', async function(){
            this.timeout(5000);
            const card = new Card({
                name: 'Vesuvan Doppelganger'
            });
            const image = await card.localImage();
            image.file.path = './test/cache/test.jpg';
            const hashValue = await hash('SHA-256', image.file.buffer);
            //vesuvanHashes.indexOf(hashValue).should.not.equal(-1);
            //hashValue.should.equal(vesuvan);
            await image.file.save();
            const savedFile = new File('./test/cache/test.jpg');
            await savedFile.load();
            const savedHashValue = await hash('SHA-256', savedFile.buffer);
            savedHashValue.should.equal(hashValue);
            //await savedFile.delete();
        }); //*/
        
        it('can generate ansi', async function(){
            this.timeout(10000);
            const card = new Card({
                name: 'Vesuvan Doppelganger'
            });
            const ansi = await card.ansi();
            console.log(ansi);
        });
    });
});

