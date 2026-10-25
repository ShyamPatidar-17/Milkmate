// config/firebaseModel.js
// Universal Firestore Model Adapter providing Mongoose-compatible API
import { db } from "./firebase.js";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";

function formatDoc(snap) {
  if (!snap.exists()) return null;
  const data = snap.data();
  // Ensure date fields are proper JS Date instances
  if (data.date && typeof data.date.toDate === "function") {
    data.date = data.date.toDate();
  } else if (data.date && !(data.date instanceof Date)) {
    data.date = new Date(data.date);
  }
  return {
    _id: snap.id,
    id: snap.id,
    ...data
  };
}

class FirestoreModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  get _col() {
    return collection(db, this.collectionName);
  }

  // Matches a document data against filter conditions (supports simple keys, $or, $and)
  _matchesFilter(data, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;

    for (const [key, value] of Object.entries(filter)) {
      if (key === "$or" && Array.isArray(value)) {
        const matchesAny = value.some(subFilter => this._matchesFilter(data, subFilter));
        if (!matchesAny) return false;
      } else if (key === "$and" && Array.isArray(value)) {
        const matchesAll = value.every(subFilter => this._matchesFilter(data, subFilter));
        if (!matchesAll) return false;
      } else {
        const docVal = data[key];
        // Loose equality to handle numbers stored as strings or vice-versa
        if (docVal != value) {
          // Check if both can be compared as numbers
          if (docVal !== undefined && value !== undefined && String(docVal).trim() !== String(value).trim()) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Fetch and filter documents
  async _queryDocs(filter = {}) {
    const snaps = await getDocs(this._col);
    const results = [];
    snaps.forEach(s => {
      const formatted = formatDoc(s);
      if (this._matchesFilter(formatted, filter)) {
        results.push(formatted);
      }
    });
    return results;
  }

  // Find multiple documents with sort support
  find(filter = {}) {
    let sortOptions = null;
    const execute = async () => {
      let docs = await this._queryDocs(filter);
      if (sortOptions) {
        const [sortKey, sortDir] = Object.entries(sortOptions)[0] || [];
        if (sortKey) {
          docs.sort((a, b) => {
            const valA = a[sortKey] !== undefined ? a[sortKey] : 0;
            const valB = b[sortKey] !== undefined ? b[sortKey] : 0;
            if (valA < valB) return sortDir === -1 ? 1 : -1;
            if (valA > valB) return sortDir === -1 ? -1 : 1;
            return 0;
          });
        }
      }
      return docs;
    };

    const promise = execute();
    promise.sort = function (options) {
      sortOptions = options;
      return execute();
    };
    return promise;
  }

  // Find single document
  async findOne(filter = {}) {
    const docs = await this._queryDocs(filter);
    return docs.length > 0 ? docs[0] : null;
  }

  // Find document by ID
  async findById(id) {
    if (!id) return null;
    try {
      const snap = await getDoc(doc(db, this.collectionName, String(id)));
      return formatDoc(snap);
    } catch (err) {
      console.error(`Firestore findById error in ${this.collectionName}:`, err.message);
      return null;
    }
  }

  // Create single document
  async create(data) {
    const cleanData = { ...data };
    delete cleanData._id;
    delete cleanData.id;
    if (cleanData.date && cleanData.date instanceof Date) {
      // keep JS Date for Firestore
    }
    const docRef = await addDoc(this._col, cleanData);
    return {
      _id: docRef.id,
      id: docRef.id,
      ...cleanData
    };
  }

  // Alias insertOne
  async insertOne(data) {
    return await this.create(data);
  }

  // Count documents matching filter
  async countDocuments(filter = {}) {
    const docs = await this._queryDocs(filter);
    return docs.length;
  }

  // Insert multiple documents
  async insertMany(arr) {
    const results = [];
    if (!Array.isArray(arr)) return results;
    for (const item of arr) {
      results.push(await this.create(item));
    }
    return results;
  }

  // Find document by ID and update
  async findByIdAndUpdate(id, updateData) {
    if (!id) return null;
    const cleanUpdate = { ...updateData };
    delete cleanUpdate._id;
    delete cleanUpdate.id;
    const docRef = doc(db, this.collectionName, String(id));
    await updateDoc(docRef, cleanUpdate);
    return await this.findById(id);
  }

  // Find document by ID and delete
  async findByIdAndDelete(id) {
    if (!id) return null;
    const docRef = doc(db, this.collectionName, String(id));
    await deleteDoc(docRef);
    return { success: true, id };
  }

  // Delete multiple documents matching filter
  async deleteMany(filter = {}) {
    const docs = await this._queryDocs(filter);
    for (const d of docs) {
      await deleteDoc(doc(db, this.collectionName, d._id));
    }
    return { deletedCount: docs.length };
  }
}

// Factory function supporting both new Model(...) and direct class calls
function createModel(collectionName) {
  const modelInstance = new FirestoreModel(collectionName);

  // Constructor function for `new Model(data)`
  function ModelConstructor(data = {}) {
    this.data = { ...data };
    this.save = async function () {
      return await modelInstance.create(this.data);
    };
  }

  // Attach all methods to constructor
  Object.getOwnPropertyNames(FirestoreModel.prototype).forEach(method => {
    if (method !== "constructor" && typeof modelInstance[method] === "function") {
      ModelConstructor[method] = modelInstance[method].bind(modelInstance);
    }
  });

  ModelConstructor.modelName = collectionName;
  return ModelConstructor;
}

export { FirestoreModel, createModel };
export default createModel;
