import { HashInterface } from '../interfaces/interfaces';
import { MOCK_OBJECTS } from '../tests/mocks';


export class MockHashDriver implements HashInterface {
    
  hash(password: string): Promise<string> {
    return Promise.resolve(MOCK_OBJECTS.HASHED_PASSWORD);
  }    
    
  verify(password: string, hash: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}
