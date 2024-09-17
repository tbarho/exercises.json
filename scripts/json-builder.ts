import { readdirSync, Dirent, writeFileSync } from "fs";
import { resolve } from "path";
import { Exercise } from "../types/exercise";
import { kebabCase } from "lodash";
import { exec } from 'child_process';

const getDirectories = (folder: string): Array<Dirent> => {
  const subFolders = readdirSync(folder, {
    withFileTypes: true,
  }).filter((dir) => dir.isDirectory());

  return subFolders;
};

const getExercises = (directories: Array<Dirent>): Array<Exercise> => {
  return directories.map((dir) => {
    const exercisePath = resolve(`./exercises/${dir.name}/exercise.json`);
    return require(exercisePath);
  });
};

const createJSONFile = async (exercises: Array<Exercise>) => {
  process.stdout.write('Creating /output directory...');
  await exec('mkdir -p output');
  process.stdout.write('Done!\n');
  process.stdout.write('Creating /output/exercises.json...');
  writeFileSync(
    "./output/exercises.json",
    JSON.stringify(exercises, null, 2),
    "utf-8"
    );
  process.stdout.write('Done!\n');
};

async function cloneImages(directories: Array<Dirent>) {
  process.stdout.write('Cloning images...\n');

  await exec(`mkdir -p ${resolve('./output/images')}`);

  for (const dir of directories) {
    const exercisePath = resolve(`./exercises/${dir.name}`);
    const key = kebabCase(dir.name);
    
    const start = resolve(`./output/images/${key}-start.jpg`);
    const end = resolve(`./output/images/${key}-end.jpg`);
    
    process.stdout.write(`Copying ${exercisePath}/images/0.jpg to ${start}...`);
    const startCommand = `cp ${exercisePath}/images/0.jpg ${start}`;
    await exec(startCommand);
    process.stdout.write('Done!\n');
    
    process.stdout.write(`Copying ${exercisePath}/images/1.jpg to ${end}...`);
    const endCommand = `cp ${exercisePath}/images/1.jpg ${end}`;
    await exec(endCommand);
    process.stdout.write('Done!\n');
  }

  process.stdout.write('Finished cloning images!\n');
}

async function run() {
  try {
    const directories = getDirectories("./exercises");
    let exercises = getExercises(directories);

    exercises = exercises.map(e => {
      const key = kebabCase(e.name);
      return {
        ...e,
        key,
        images: {
          start: `images/${key}-start.jpg`,
          end: `images/${key}-end.jpg`,
        }
      }
    })
    await createJSONFile(exercises);
    await cloneImages(directories);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();

