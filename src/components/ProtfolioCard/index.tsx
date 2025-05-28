import * as S from './styled';

import React from 'react';
import Image from '../Image';

import { Project } from '@/src/type';
import { FaFlutter } from 'react-icons/fa6';
import { DiMsqlServer } from 'react-icons/di';
import { SiDart, SiMysql, SiSpringboot } from 'react-icons/si';
import { BiLogoJavascript, BiLogoTypescript } from "react-icons/bi";
import { FaLaravel, FaNodeJs, FaReact, FaVuejs } from 'react-icons/fa';


type ProjectCardProps = {
  project: Project;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const iconStyle = { fontSize: '15px', marginRight: '3px' };
  const getTechIcon = (tech: string) => {
    switch (tech) {
      case 'Javascript':
        return <BiLogoJavascript style={iconStyle} />;
      case 'Typescript':
        return <BiLogoTypescript style={iconStyle} />;
      case 'React':
        return <FaReact style={iconStyle} />;
      case 'Vue':
        return <FaVuejs style={iconStyle} />;
      case 'Flutter':
        return <FaFlutter style={iconStyle} />;
      case 'Dart':
        return <SiDart style={iconStyle} />;
      case 'Node.js':
        return <FaNodeJs style={iconStyle} />;
      case 'Spring Boot':
        return <SiSpringboot style={iconStyle} />;
      case 'Laravel':
        return <FaLaravel style={iconStyle} />;
      case 'MySQL':
        return <SiMysql style={iconStyle} />;
      case 'MSSQL':
        return <DiMsqlServer style={iconStyle} />;
      default:
        return null;
    }
  };

  return (
    <S.Wrapper>
      <S.Image>
        <Image alt='project-image' src={project.thumbnailUrl} />
      </S.Image>
      <S.Content>
        <S.TechList>
          {project.techStack.map((tech, index) => (
            <S.Tech tech={tech} key={index}>
              {getTechIcon(tech)}
              {tech}
            </S.Tech>
          ))}
        </S.TechList>
        <S.Title>{project.title}</S.Title>
        <S.Description>{project.description}</S.Description>
        <S.ProjectLinkList>
          {Object.keys(project.links).map(
            (link, index) =>
              project.links[link as keyof typeof project.links] && (
                <S.ProjectLink key={index} target='_blank' href={project.links[link as keyof typeof project.links]}>
                  {link}
                </S.ProjectLink>
              ),
          )}
        </S.ProjectLinkList>
      </S.Content>
    </S.Wrapper>
  );
};

export default ProjectCard;
